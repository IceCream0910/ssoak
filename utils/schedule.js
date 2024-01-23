
async function getScheduleData(date) {
    const data = await getData(date);
    return data;
}


module.exports = {
    getScheduleData
};

//아래는 내부 함수

async function getData(date) {
    // localStorage에서 저장된 key 확인
    const cachedKey = localStorage.getItem('scheduleCachedKey');

    if (cachedKey && cachedKey === date.substring(0, 6)) {
        const cachedData = localStorage.getItem('scheduleCachedData');
        return JSON.parse(cachedData);
    }

    // 저장된 데이터가 없으면 API 호출
    const res = await fetch(`https://sungil-school-api.vercel.app/schedule/${date}`);
    const data = await res.json();

    // mealCachedKey와 mealCachedData 업데이트
    localStorage.setItem('scheduleCachedKey', date.substring(0, 6));
    localStorage.setItem('scheduleCachedData', JSON.stringify(data));

    return data;
}