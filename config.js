/*
  우리 학교 설정 파일
  따옴표 " " 안의 내용만 바꾸세요. 따옴표와 쉼표는 지우지 마세요.
  설정 만들기 화면(make.html)에서 주소를 붙여 넣으면 이 내용을 그대로 만들어 줍니다.
*/
window.SCHOOL = {
  /* 필수: 시트의 「공개용」 탭을 웹에 게시한 주소 (…output=csv 로 끝나는 주소) */
  sheet: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0fDCUza_YyL9M-ENahuj-B6wrSZRI1iiy8Id6eRvzxefLJYkiV_d2-xdPy5Uobxrlkp76GiFBsCqP/pub?gid=1586721779&single=true&output=csv",

  /* 필수: 설문 응답자 링크 (…/viewform 로 끝나는 긴 주소) */
  form: "https://docs.google.com/forms/d/e/1FAIpQLScn4-GCSMgHo65Ut0sMFcS7CXjA6_2oTZi4PXbC7AVE9AT9Qg/viewform",

  /* 선택: 학교 이름. 맨 위에 작게 나와요. 예: "○○고등학교" */
  name: "",

  /* 선택: 맨 위 응원 문구. / 를 넣으면 줄이 바뀌어요. 비워 두면 기본 문구가 나와요. */
  message: "",

  /* 선택: 응원 문구 아래 서명. 비워 두면 "선생님이"로 나와요. */
  sign: "",

  /* 공개 데모에서 각 반의 첫 편지와 응원 카드에 쓰는 예시 */
  classes: {
    "1": {
      name: "3학년 1반",
      message: "1반 얘들아, 매일 조금씩 해낸 너희를 기억해./시험 날은 너희가 해 온 만큼만 차분하게 풀고 와.",
      sign: "햇살 선생님이",
      letter: { group: "junior", from: "1반을 응원하는 후배", text: "1반 선배들, 복도에서 먼저 인사해 주셔서 고마웠어요. 이번엔 저희가 선배들을 응원할게요!" }
    },
    "2": {
      name: "3학년 2반",
      message: "2반 얘들아, 서로 챙겨 주며 여기까지 와 줘서 고마워./문제를 한 장씩 넘기듯 차분하게 하루를 보내고 와.",
      sign: "나무 선생님이",
      letter: { group: "parent", from: "2반을 응원하는 학부모", text: "2반 친구들, 아침부터 저녁까지 애쓴 시간을 기억해요. 마음 편히 다녀오세요!" }
    }
  },
  commonSample: { group: "teacher", from: "3학년 전체를 응원하는 선생님", text: "3학년 모두에게, 시험장에서는 한 문제씩 차근차근 풀어 봐요. 여러분을 응원합니다!" }
};
