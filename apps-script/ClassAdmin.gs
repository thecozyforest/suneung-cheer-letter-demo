const CLASS_SETTINGS_TAB = '반 설정';
const CLASS_TARGET_TITLE = '어느 반에 보내는 편지인가요?';
const STUDENT_SITE = 'https://thecozyforest.github.io/suneung-cheer-letter-demo/';

function openClassManager() {
  SpreadsheetApp.getUi().showSidebar(
    HtmlService.createHtmlOutput(CLASS_MANAGER_HTML).setTitle('수능 응원 · 반별 링크 관리')
  );
}

function classSettingsSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CLASS_SETTINGS_TAB);
  if (!sheet) throw new Error('반 설정 탭을 찾지 못했어요. 연결을 확인해 주세요.');
  return sheet;
}

function classSettingsRows_(sheet) {
  const rowCount = sheet.getLastRow() - 1;
  return rowCount > 0 ? sheet.getRange(2, 1, rowCount, 4).getDisplayValues() : [];
}

function classNumber_(value) {
  const id = String(value || '').trim();
  if (id && !/^[1-9][0-9]?$/.test(id)) throw new Error('반 번호는 1부터 99까지 숫자로 적어 주세요.');
  return id;
}

function classSettingsResult_(id, row) {
  const [, school = '', message = '', sign = ''] = row || [];
  return {
    school, message, sign, exists: Boolean(row),
    url: STUDENT_SITE + (id ? '?class=' + id : '')
  };
}

function readClassSettings(classNumber) {
  const id = classNumber_(classNumber);
  const row = classSettingsRows_(classSettingsSheet_()).find(values => values[0] === (id || 'all'));
  return classSettingsResult_(id, row);
}

function saveClassSettings(input) {
  const id = classNumber_(input.classNumber);
  const key = id || 'all';
  const school = String(input.school || '').trim().slice(0, 30);
  const message = String(input.message || '').trim().slice(0, 90);
  const sign = String(input.sign || '').trim().slice(0, 15);
  if (!message || !sign) throw new Error('응원 문구와 서명을 모두 적어 주세요.');

  const lock = LockService.getDocumentLock();
  lock.waitLock(10000);
  try {
    const sheet = classSettingsSheet_();
    const rows = classSettingsRows_(sheet);
    const index = rows.findIndex(row => row[0] === key);
    if (id) addFormClass_(sheet.getParent(), id);
    const row = [key, school, message, sign];
    const cells = row.map(text => SpreadsheetApp.newRichTextValue().setText(text).build());
    sheet.getRange(index < 0 ? sheet.getLastRow() + 1 : index + 2, 1, 1, 4).setRichTextValues([cells]);
    SpreadsheetApp.flush();
    return classSettingsResult_(id, row);
  } finally {
    lock.releaseLock();
  }
}

function addFormClass_(spreadsheet, id) {
  const responseSheet = spreadsheet.getSheets().find(sheet => sheet.getFormUrl());
  if (!responseSheet) throw new Error('이 시트에 연결된 구글폼을 찾지 못했어요.');
  const form = FormApp.openByUrl(responseSheet.getFormUrl());
  if (form.getDestinationId() !== spreadsheet.getId()) throw new Error('구글폼의 응답 저장 위치를 확인해 주세요.');
  const field = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE).find(item => item.getTitle() === CLASS_TARGET_TITLE);
  if (!field) throw new Error('구글폼에서 받는 반 질문을 찾지 못했어요.');
  const question = field.asMultipleChoiceItem();
  const values = question.getChoices().map(choice => choice.getValue());
  const label = id + '반';
  if (!values.includes(label)) question.setChoiceValues(values.concat(label));
}

const CLASS_MANAGER_HTML = `<!doctype html>
<html lang="ko"><head><base target="_blank"><meta charset="utf-8"><style>
*{box-sizing:border-box}body{font:14px/1.5 system-ui,sans-serif;color:#302722;padding:12px}p{margin:0 0 12px}label{display:block;margin-top:12px;font-weight:700}input,textarea{width:100%;margin-top:4px;padding:8px;border:1px solid #b7a49a;border-radius:6px;font:inherit}textarea{resize:vertical}button{font:inherit;padding:7px 10px;margin:8px 4px 0 0;border:1px solid #a75635;border-radius:6px;background:white;color:#722b13;cursor:pointer}button[type=submit]{background:#9b3f21;color:white}fieldset{border:0;margin:0;padding:0}small{display:block;margin-top:4px;color:#695950}#status{margin-top:10px}#result{margin-top:12px;padding:10px;background:#fff1e4;border-radius:8px}a{color:#722b13}
</style></head><body>
<p>반 번호를 넣고 저장하세요. 같은 반을 수정해도 학생 주소는 그대로예요.</p>
<form id="settings"><fieldset id="fields">
<label for="class-number">반 번호</label><input id="class-number" inputmode="numeric" maxlength="2" pattern="[1-9][0-9]?" placeholder="예) 4"><small>비워 두면 3학년 공통 페이지를 설정해요.</small>
<button type="button" id="load">저장된 내용 불러오기</button>
<label for="school">학교 이름 (선택)</label><input id="school" maxlength="30">
<label for="message">첫 화면 응원 문구</label><textarea id="message" rows="3" maxlength="90" required></textarea>
<label for="sign">서명</label><input id="sign" maxlength="15" placeholder="예) ○○○ 선생님이" required>
<button type="submit">저장</button>
</fieldset></form>
<p id="status" role="status"></p>
<div id="result" hidden><label for="url">학생에게 보낼 주소</label><input id="url" readonly><button id="copy" type="button">주소 복사</button><a id="preview" rel="noopener">학생 화면 열기</a></div>
<script>
const byId = id => document.getElementById(id);
const form = byId('settings'), status = byId('status'), result = byId('result');
const classNumber = byId('class-number'), school = byId('school'), message = byId('message'), sign = byId('sign');
const fields = byId('fields'), url = byId('url');
function busy(text) { fields.disabled = true; result.hidden = true; status.textContent = text; }
function failed(error) { fields.disabled = false; status.textContent = error.message || '다시 시도해 주세요.'; }
function showLink(data) { url.value = data.url; byId('preview').href = data.url; result.hidden = false; }
classNumber.addEventListener('input', () => {
  school.value = ''; message.value = ''; sign.value = ''; result.hidden = true; status.textContent = '';
});
byId('load').addEventListener('click', () => {
  if (!classNumber.reportValidity()) return;
  busy('불러오는 중이에요.');
  google.script.run.withFailureHandler(failed).withSuccessHandler(data => {
    fields.disabled = false;
    school.value = data.school; message.value = data.message; sign.value = data.sign;
    status.textContent = data.exists ? '저장된 내용을 불러왔어요.' : '처음 등록하는 페이지예요. 문구와 서명을 적고 저장하세요.';
    if (data.exists) showLink(data);
  }).readClassSettings(classNumber.value);
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const input = {classNumber:classNumber.value,school:school.value,message:message.value.replace(/\\r?\\n/g,'/'),sign:sign.value};
  busy('저장하고 구글폼을 확인하는 중이에요.');
  google.script.run.withFailureHandler(failed).withSuccessHandler(data => {
    fields.disabled = false;
    status.textContent = input.classNumber ? '저장했어요. 구글폼에 이 반을 선택할 수 있어요. 학생 화면 반영에는 몇 분 걸릴 수 있어요.' : '공통 문구를 저장했어요. 학생 화면 반영에는 몇 분 걸릴 수 있어요.';
    showLink(data);
  }).saveClassSettings(input);
});
byId('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(url.value); status.textContent = '주소를 복사했어요.'; }
  catch (error) { url.select(); status.textContent = '주소를 선택했어요. 복사해서 보내 주세요.'; }
});
</script></body></html>`;
