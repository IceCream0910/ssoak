import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import 'react-spring-bottom-sheet/dist/style.css'
import Spacer from '../common/spacer';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'
import { getScheduleData } from '../../utils/schedule';

function NewsLetter() {
    const [data, setData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            await fetch('https://sungil-school-api.vercel.app/notices')
                .then(res => res.json())
                .then(res => setData(res));
        }
        fetchData();
    }, []);

    return (
        <div>
            <div className="card" style={{ paddingBottom: "20px" }}>
                <div className="card-title"
                    onClick={() => window.open('https://sungil-h.goesn.kr/sungil-h/na/ntt/selectNttList.do?mi=19914&bbsId=15524', '_blank')}>
                    가정통신문 <IonIcon name="chevron-forward-outline" style={{ position: "relative", top: "2px" }} />
                </div>

                {!data && (<>
                    <Spacer y={20} />
                    <div className="skeleton-loader"></div>
                </>
                )}

                <Spacer y={20} />
                {data && data.articles && data.articles.slice(0, 5).map((article, index) => {
                    return (
                        <div key={index}
                            onClick={() => window.open(article.view_link, '_blank')}
                            style={{ padding: '10px 0' }}>
                            <h4 style={{ opacity: .7, margin: 0, fontSize: '18px' }}>{article.title}</h4>
                            <Spacer y={5} />
                            <span style={{ opacity: .4 }}>{article.reg_date}</span>
                            <Spacer y={10} />
                            <hr style={{ opacity: .1 }} />
                        </div>
                    );
                })}

                <Spacer y={10} />

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
    background-color: #00bfa5;
    color: #000;
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

export default NewsLetter;
