
import moment from 'moment';

function getDayOfWeekString(date) {
    const dayNum = moment(date).day();
    let day = '';
    switch (dayNum) {
        case 1:
            day = 'mon';
            break;
        case 2:
            day = 'tue';
            break;
        case 3:
            day = 'wed';
            break;
        case 4:
            day = 'thu';
            break;
        case 5:
            day = 'fri';
            break;
        default:
            break;
    }
    return day;
}

function getCurrentPeriod() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const intervals = [
        { start: 0, end: 540, period: 0 }, // 0:00 - 8:30
        { start: 540, end: 580, period: 1 }, // 8:30 - 9:40
        { start: 580, end: 640, period: 2 }, // 9:40 - 10:40
        { start: 640, end: 700, period: 3 }, // 10:40 - 11:40
        { start: 700, end: 810, period: 4 }, // 11:40 - 13:30
        { start: 810, end: 870, period: 5 }, // 13:30 - 14:30
        { start: 870, end: 930, period: 6 }, // 14:30 - 15:30
        { start: 930, end: 990, period: 7 },  // 15:30 - 16:30
        { start: 990, end: 1440, period: 8 }  // 16:30 - 24:00
    ];

    for (let i = 0; i < intervals.length; i++) {
        if (intervals[i].start <= currentTime && currentTime <= intervals[i].end) {
            return intervals[i].period;
        }
    }

    return 'null';
}

module.exports = {
    getDayOfWeekString,
    getCurrentPeriod
};