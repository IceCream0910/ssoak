
import IonIcon from '@reacticons/ionicons';
import React from 'react';

function LinkCards() {
    return (
        <div className="card" style={{ display: "flex", flexDirection: "row", gap: "20px", width: '100%' }}>
            <div className="notice-card" style={{ width: "50%" }}
                onClick={() => window.open('https://sungil-h.goesn.kr/', '_blank')}>
                <h4>학교 홈페이지</h4>
                <IonIcon name="school-outline" style={{ background: 0, position: "absolute", top: "20px", left: "20px", fontSize: "50px", opacity: .1, color: "#819fff" }}></IonIcon>

                <p>성일고등학교 공식 홈페이지 바로가기</p>
            </div>
            <div className="notice-card" style={{ width: "50%" }}
                onClick={() => window.open('https://www.youtube.com/@sungilofficial', '_blank')}>
                <h4>성일고 유튜브</h4>
                <IonIcon name="logo-youtube" style={{ background: 0, position: "absolute", top: "20px", right: "20px", fontSize: "50px", opacity: .1, color: "#819fff" }}></IonIcon>

                <p>영상으로 보는 입시 정보 및 학교 소식</p>
            </div>

            <style jsx>{`
            .card {
                width: calc(100% + 40px) !important;
                backdrop-filter: blur(16px) saturate(180%);
                -webkit-backdrop-filter: blur(16px) saturate(180%);
                color: var(--text);
                display: flex;
                justify-content: space-between;
            }

            .notice-card {
                background-color: var(--secondary-bg);
                padding: 0 20px 10px 20px;
                display: flex;
                flex-direction: column;
                cursor: pointer;
                margin-bottom: 15px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, .125);
                -webkit-transition: .5s;
                -moz-transition: .5s;
                -o-transition: .5s;
                transition: .5s;
            }

            .notice-card p {
                opacity: .7;
                font-size: 14px;
                margin: 0;
                margin-bottom :15px;
            }

            .notice-card:active {
                transform: scale(0.98);
            }
            `}</style>
        </div>
    );
}

export default LinkCards;
