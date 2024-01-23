
export default async function handler(req, res) {
    res.status(200).json({ result: getRandomNickname() });
}

function getRandomNickname() {
    const words = {
        "adjective": [
            "귀여운",
            "익명의",
            "용감한",
            "튼튼한",
            "상냥한",
            "마당발",
            "멋쟁이",
            "씩씩한",
            "키다리",
            "웃는",
            "세심한",
            "대범한",
            "똑똑한"
        ],
        "noun": [
            "체리",
            "자두",
            "딸기",
            "오렌지",
            "사과",
            "키위",
            "메론",
            "포도",
            "버찌",
            "야자수",
            "복숭아",
            "레몬",
            "수박",
            "망고",
            "홍시",
            "머루",
            "자몽",
            "살구",
            "리치",
            "참다래",
            "모과",
            "청포도",
            "유자",
            "산딸기",
            "매실",
            "코코넛",
            "바나나",
            "석류",
            "대추",
            "단감",
            "망고스틴",
            "산딸기",
            "아보카도",
            "구아바",
            "무화과",
            "파파야",
            "블루베리",
            "파인애플",
            "한라봉",
            "블림빙",
            "용과",
            "오미자",
            "꿀수박",
            "왕체리",
            "감자",
            "고구마",
            "깻잎",
            "당근",
            "도라지",
            "대파",
            "마늘",
            "토마토",
            "미나리",
            "버섯",
            "배추",
            "부추",
            "케일",
            "브로콜리",
            "생강",
            "시금치",
            "연근",
            "우엉",
            "양파",
            "양배추",
            "호박",
            "깻잎",
            "옥수수",
            "청경채",
            "배추",
            "시금치",
            "부추",
            "가지",
            "실파",
            "대파",
            "미나리",
            "애호박",
            "단호박",
            "오이",
            "당근",
            "감자",
            "고구마",
            "버섯",
            "양송이",
            "단무지",
            "피클",
            "무청",
            "상추",
            "양배추",
            "양상추",
            "바질",
            "마늘",
            "생강",
            "순무",
            "브로콜리",
            "인삼",
            "쑥갓",
            "피망",
            "피자",
            "햄버거",
            "떡볶이",
            "토스트",
            "개발자",
            "고니",
            "공작",
            "거위",
            "기러기",
            "까치",
            "까마귀",
            "두루미",
            "독수리",
            "백조",
            "비둘기",
            "부엉이",
            "오리",
            "앵무새",
            "제비",
            "참새",
            "칠면조",
            "타조",
            "펭귄",
            "개구리",
            "재규어",
            "족제비",
            "치타",
            "청설모",
            "친칠라",
            "침팬지",
            "캥거루",
            "코알라",
            "코요테",
            "코뿔소",
            "카피바라",
            "토끼",
            "판다",
            "표범",
            "퓨마",
            "하마",
            "호랑이",
            "하이에나",
            "박쥐",
            "북극곰",
            "북극여우",
            "바다사자",
            "바다표범",
            "사슴",
            "사자",
            "수달",
            "순록",
            "스컹크",
            "스라소니",
            "양",
            "여우",
            "염소",
            "영양",
            "야크",
            "원숭이",
            "알파카",
            "오소리",
            "얼룩말",
            "바둑이",
            "낙타",
            "노루",
            "노새",
            "늑대",
            "너구리",
            "나무늘보",
            "담비",
            "밤비",
            "듀공",
            "돌고래",
            "다람쥐",
            "두더지",
            "당나귀",
            "라마",
            "래서판다",
            "물개",
            "물범",
            "밍크",
            "도라에몽",
            "미어캣",
            "강아지",
            "곰돌이",
            "가젤",
            "고래",
            "기린",
            "고릴라",
            "고라니",
            "고양이",
            "고슴도치",
            "기니피그",
            "개미핥기",
            "크롱",
            "퉁퉁이",
            "피카츄",
            "파이리",
            "꼬부기",
            "피죤투",
            "또가스",
            "디지몬",
            "마리오",
            "비욘세",
            "참치",
            "연어",
            "초밥",
            "매운탕",
            "쭈꾸미",
            "돌고래",
            "백구",
            "누렁이",
            "흰둥이",
            "된장찌개",
            "김치찌개",
            "루피",
            "파스타",
            "비타민",
            "코카콜라",
            "자일리톨",
            "치즈피자",
            "참치김밥",
            "새우깡",
            "고래밥",
            "치킨버거",
            "닭다리",
            "닭날개",
            "숯불갈비",
            "레몬사탕",
            "뽀로로",
            "치즈",
            "닭갈비",
            "마카롱",
            "도너츠",
            "누룽지",
            "모짜렐라",
            "커피",
            "야옹이",
            "팝스타",
            "파랑새",
            "마그네슘",
            "서포터",
            "만수르",
            "재벌",
            "갑부",
            "후원자"
        ]
    };
    var adjective = words.adjective[Math.floor(Math.random() * words.adjective.length)];
    var noun = words.noun[Math.floor(Math.random() * words.noun.length)];
    return adjective + noun;
}