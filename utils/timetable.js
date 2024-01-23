async function getTimetableData(date, grade, classNum) {
    const data = await getData(date, grade, classNum);
    return data;
}

function SimplifySubjectName(str) {
    var replacements = {
        "통합과학": "통과",
        "통합사회": "통사",
        "과학탐구실험": "과탐실",
        "일본어": "일",
        "생활과 윤리": "생윤",
        "생활과 과학": "생과",
        "심화 국어": "심국",
        "음악 감상과 비평": "음악",
        "운동과 건강": "운동",
        "정치와 법": "정법",
        "여행지리": "여행",
        "지구과학": "지구",
        "중국어": "중",
        "미술 감상과 비평": "미술",
        "생명과학": "생",
        "언어와 매체": "언매",
        "경제 수학": "경수",
        "확률과 통계": "확통",
        "영어권 문화": "영문",
        "사회문제 탐구": "사문탐",
        "사회·문화": "사문",
        "윤리와 사상": "윤사",
        "동아시아사": "동아",
        "한국지리": "한지",
        "세계지리": "세지",
        "심화 수학": "심수",
        "과학과제 연구": "과과연",
        "정보과학": "정보",
        "스포츠 생활": "스포츠",
        "융합과학": "융과",
        "물리학": "물",
        "화학": "화",
        "수학과제 탐구": "수탐",
        "진로활동": "진로",
        "화법과 작문": "화작",
        "영어 독해와 작문": "영독",
        "인공지능 수학": "인수",
        "미적분": "미적",
        "자율활동": "자율",
        "동아리활동": "동아리",
        "실용 경제": "실경"
    };

    var re = new RegExp(Object.keys(replacements).join("|"), "gi");
    return str.replace(re, function (matched) {
        return replacements[matched.toLowerCase()];
    });
}

module.exports = {
    getTimetableData,
    SimplifySubjectName
};


async function getData(date, grade, classNum) {
    // localStorage에서 저장된 key 확인
    const cachedKey = localStorage.getItem('timetable_cachedKey');

    if (cachedKey) {
        // timetable_cachedKey가 존재하면 파싱하여 확인
        const key = `${date}_${grade}_${classNum}`;

        // 저장된 데이터가 있는지 확인
        if (cachedKey === key) {
            // 저장된 데이터가 있으면 timetable_cachedData에서 데이터를 가져와서 반환
            const cachedData = localStorage.getItem('timetable_cachedData');
            return JSON.parse(cachedData);
        }
    }

    // 저장된 데이터가 없으면 API 호출
    const res = await fetch(`https://sungil-school-api.vercel.app/timetable?date=${date}&grade=${grade}&classNum=${classNum}`);
    const data = await res.json();

    // timetable_cachedKey와 timetable_cachedData 업데이트
    localStorage.setItem('timetable_cachedKey', `${date}_${grade}_${classNum}`);
    localStorage.setItem('timetable_cachedData', JSON.stringify(data));

    return data;
}

