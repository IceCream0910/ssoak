import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import 'react-spring-bottom-sheet/dist/style.css'
import Spacer from '../common/spacer';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'
import { getScheduleData } from '../../utils/schedule';

function Schedule({ date }) {
    const [data, setData] = useState(null);
    const cnt = useRef(0);

    useEffect(() => {
        if (!date) return;
        async function fetchData() {
            setData(await getScheduleData(date));
        }
        fetchData();
    }, [date]);

    useEffect(() => {
        console.log(data)
    }, [data]);


    return (
        <div>
            <div className="card" style={{ paddingBottom: "20px" }}>
                <div className="card-title"
                    onClick={() => window.open('https://sungil-h.goesn.kr/sungil-h/ps/schdul/selectSchdulMainList.do?mi=19599', '_blank')}>
                    이번 달 학사일정 <IonIcon name="chevron-forward-outline" style={{ position: "relative", top: "2px" }} />
                </div>

                {!data && (<>
                    <Spacer y={20} />
                    <div className="skeleton-loader"></div>
                </>
                )}

                <Spacer y={10} />
                {data && data.schedule && Object.entries(data.schedule).map(([key, value]) => {
                    if (value === '토요휴업일' || value.includes('방학')) return null;
                    cnt.current++;
                    return (
                        <div className="schedule-item">
                            <span className="day-text">
                                <span style={{ fontSize: '18px' }}>{key}</span>
                                <span style={{ fontSize: '12px', opacity: .6, marginTop: '-2px' }}>토</span>
                            </span>
                            <h3 className="schedule-name">{value}</h3>
                        </div>
                    );
                })}

                {cnt.current === 0 && (<>
                    <Spacer y={5} />
                    <span style={{ opacity: .7, fontSize: '14px' }}>이번 달에는 특별한 일정이 없네요</span>
                </>
                )}

            </div>
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

.schedule-item {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
}

.schedule-item .day-text {
    border-radius: 15px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 15px;
    flex-direction: column;
    background-color: var(--button-bg);
}

.schedule-item .schedule-name {
    font-size: 17px;
    color: #858585;
    position: relative;
}
            `}</style>
        </div >
    );
}

export default Schedule;
