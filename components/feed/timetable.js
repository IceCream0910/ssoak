import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import 'react-spring-bottom-sheet/dist/style.css'
import Spacer from '../common/spacer';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'

import { getTimetableData, SimplifySubjectName } from '../../utils/timetable';
import { getDayOfWeekString, getCurrentPeriod } from '../../utils/date';

function Timetable({ title, date, grade, classNum }) {
    const [data, setData] = useState(null);
    const [day, setDay] = useState(null);
    const [currentPeriod, setCurrentPeriod] = useState(null);

    const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);

    useEffect(() => {
        if (!date || !grade || !classNum) return;
        async function fetchData() {
            setDay(getDayOfWeekString(date));
            setCurrentPeriod(getCurrentPeriod());
            setData(await getTimetableData(date, grade, classNum));
        }
        fetchData();
    }, [date, grade, classNum]);

    return (
        <div>
            <div className="card" style={{ paddingBottom: "20px" }} id="timetable-horizontal-wrap">
                <div className="card-title" onClick={() => setIsWeekModalOpen(true)}>
                    {title} <IonIcon name="chevron-forward-outline" style={{ position: "relative", top: "2px" }} />
                </div>

                {!data && (<>
                    <Spacer y={20} />
                    <div className="skeleton-loader"></div>
                </>
                )}

                {data && Object.entries(data[day]).length == 0 && <>
                    <Spacer y={20} />
                    <span style={{ opacity: .7, fontSize: '14px' }}>등록된 시간표 정보가 없어요</span>
                </>
                }
                <Spacer y={30} />
                <div className="timetable-horizontal">
                    {data && day && Object.entries(data[day]).map(([key, value]) => (
                        <div className={(parseInt(key) + 1 == currentPeriod) ? "timetable-horizontal-item active" : "timetable-horizontal-item"}>
                            <span>{parseInt(key) + 1}</span>
                            <h6>{SimplifySubjectName(value.ITRT_CNTNT)}</h6>
                        </div>
                    ))}
                </div>

                {data && Object.entries(data[day]).length > 0 && <>
                    <div className="timetable-horizontal-progress" style={{ width: `${(currentPeriod === 0 || currentPeriod === 8) ? 0 : (currentPeriod / Object.entries(data[day]).length) * 100}%` }}></div>
                    <Spacer y={8} />
                    <div className="timetable-horizontal-desc">
                        {Object.entries(data[day]).length != 7
                            && <span>학교가 일찍 끝나는 날이에요!</span>
                        }
                    </div>
                </>}
            </div>

            <BottomSheet open={isWeekModalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setIsWeekModalOpen(false)}>
                <div className="bottom-sheet">
                    <h2>이번 주 시간표</h2>
                    <Spacer y={30} />
                    <table>
                        <thead>
                            <tr style={{ opacity: .5, fontSize: '14px' }}>
                                <th className={day === 'mon' ? 'active' : ''}>월</th>
                                <th className={day === 'tue' ? 'active' : ''}>화</th>
                                <th className={day === 'wed' ? 'active' : ''}>수</th>
                                <th className={day === 'thu' ? 'active' : ''}>목</th>
                                <th className={day === 'fri' ? 'active' : ''}>금</th>
                            </tr>
                        </thead>
                        <Spacer y={5} />
                        <tbody>
                            {data && Object.entries(data.mon).map(([period, subject]) => (
                                <tr key={period}>
                                    {Object.entries(data).map(([dayVal, subjects]) => (
                                        <th key={dayVal} className={dayVal === day ? 'active' : ''}>{subjects[period]?.ITRT_CNTNT}</th>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Spacer y={30} />
                    <button onClick={() => setIsWeekModalOpen(false)}>닫기</button>
                </div>
            </BottomSheet>

            <style jsx>{`
.card {
    display: flex;
    flex-direction: column;
    background-color: var(--secondary-bg);
    font-weight: 400;
    min-height: 20px;
    overflow: hidden;
    width: 100%;
    z-index: 1;
    border-radius: 20px;
    padding: 15px 20px;
    padding-bottom: 30px;
}

.card-title {
    opacity: 0.6;
    font-size: 14px;
}

.timetable-horizontal {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    max-height: 50px;
}

.timetable-horizontal-item {
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;
    gap:0;
}

.timetable-horizontal-item h6 {
    font-size: 16px;
    font-weight: 400;
    margin-top: 5px;
    opacity: 0.8;
}

.timetable-horizontal-item.active {
    color: #708aff;
}

.timetable-horizontal-item.active h6 {
    font-weight: 600;
}

.timetable-horizontal-item span {
    opacity: 0.6;
}

.timetable-horizontal-progress {
    width: 7.14%;
    box-sizing: border-box;
    height: 5px;
    background-color: #5272ff;
    border-radius: 40px !important;
}

.timetable-horizontal-desc {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    opacity: 0.5;
    font-size: 11px;
}
            `}</style>
        </div >
    );
}

export default Timetable;
