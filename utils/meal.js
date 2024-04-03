import firestore from "../firebase/firebase"
import { collection, addDoc, doc, getDoc } from "@firebase/firestore";

async function getMealData(date) {
    const data = await getData(date);
    const result = await convertHTML(data, date);
    return result;
}

async function getMonthMealData(date) {
    const data = await getData(date);
    const meal = data.meal;
    return meal;
}

const getAllergyLabel = (num) => {
    switch (num) {
        case 0:
            return '난류';
        case 1:
            return '우유';
        case 2:
            return '메밀';
        case 3:
            return '땅콩';
        case 4:
            return '대두';
        case 5:
            return '밀';
        case 6:
            return '고등어';
        case 7:
            return '게';
        case 8:
            return '새우';
        case 9:
            return '돼지고기';
        case 10:
            return '복숭아';
        case 11:
            return '토마토';
        case 12:
            return '아황산염';
        case 13:
            return '호두';
        case 14:
            return '닭고기';
        case 15:
            return '쇠고기';
        case 16:
            return '오징어';
        case 17:
            return '조개류(굴, 전복, 홍합 포함)';
        case 18:
            return '잣';
        default:
            return '';
    }
};


module.exports = {
    getMealData,
    getMonthMealData,
    getAllergyLabel
};

//아래는 내부 함수

async function getData(date) {
    // localStorage에서 저장된 key 확인
    const cachedKey = localStorage.getItem('mealCachedKey');

    if (cachedKey && cachedKey === date.substring(0, 6)+'_') {
        const cachedData = localStorage.getItem('mealCachedData');
        return JSON.parse(cachedData);
    }

    // 저장된 데이터가 없으면 API 호출
    const res = await fetch(`https://sungil-school-api.vercel.app/meal/${date}`);
    const data = await res.json();

    // mealCachedKey와 mealCachedData 업데이트
    localStorage.setItem('mealCachedKey', date.substring(0, 6)+'_');
    localStorage.setItem('mealCachedData', JSON.stringify(data));

    return data;
}


function convertHTML(data, date) {
    //사용자가 설정한 알레르기 정보 가져오기
    var allergyList = '';
    if (localStorage.getItem("sungil_alleList")) {
        allergyList = localStorage.getItem("sungil_alleList").split(',');
        allergyList = allergyList.map(function (val) { return ++val; });
        allergyList = allergyList.join(',').toString();
    } else {
        allergyList = '';
    }
    const favTagsList = ["훈제", "참치마요", "미트볼", "우동", "망고", "샌드위치", "피자", "햄버거", "돈까스", "브라운소스", "핫바", "새우튀김", "스파게티", "감자튀김", "빵", "떡꼬치", "와플", "바나나", "스테이크", "탕수육", "스크렘블", "초코", "맛탕", "바베큐", "떡갈비", "비엔나", "브라우니", "치킨마요", "타코야끼", "도넛", "치즈", "핫도그", "치킨", "스프", "소세지", "메론", "떡볶이", "샐러드", "모닝빵", "불고기", "햄"];

    const day = date.substring(6, 8).replace(/(^0+)/, "");
    if (data.meal[day]) {
        const currentMenuRaw = data.meal[day].toString().replace(':', '');
        const menuArr = currentMenuRaw.replaceAll('\n', '<br/>').replaceAll('\'', '').replaceAll('[중식]', '').replaceAll('``', '').replaceAll(' (', '').replaceAll("*", "").replaceAll("(ㅆ)", "").split('<br/>');

        var menuData = [];

        for (var i = 0; i < menuArr.length; i++) {
            //알레르기 번호와 메뉴명 분리
            if (menuArr[i].match(/\d+/)) {
                var allergyIndex = menuArr[i].match(/\d+/).index;
                var allergy = menuArr[i].substring(allergyIndex, menuArr[i].length).replaceAll(')', '').replaceAll('(', '');
            } else {
                var allergy = 'none';
                var allergyIndex = menuArr[i].length;
            }
            var menuName = menuArr[i].substring(0, allergyIndex); //메뉴명 추출

            let isDanger = false; // 알레르기 포함 여부
            let isFavorite = false; // 맛있는 메뉴 여부

            // 알레르기 포함 여부 체크
            var tempAlleList = allergy.split('.');
            tempAlleList.forEach(element => {
                if (allergyList.split(',').includes(element)) {
                    isDanger = true;
                }
            });



            // 맛있는 메뉴 여부 체크
            for (var element of favTagsList) {
                if ((menuName).includes(element)) {
                    isFavorite = true;
                }
            }

            menuData.push({ name: menuName, allergy: allergy, isFavorite: isFavorite, isDanger: isDanger });
        }

        return menuData;
    }
    else {
        return null;
    }
}
