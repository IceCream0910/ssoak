
import IonIcon from '@reacticons/ionicons';
import React from 'react';

function installCards() {
    let installPrompt = null;

    window.addEventListener("beforeinstallprompt", async (event) => {
        installPrompt = event;
    });

    window.addEventListener("appinstalled", () => {
        disableInAppInstallPrompt();
    });

    function disableInAppInstallPrompt() {
        installPrompt = null;
    }

    async function installPWA() {
        if (!installPrompt) {
            toast('이미 설치되어 있거나 지원되지 않는 브라우저입니다.')
            return;
        }

        const result = await installPrompt.prompt();
        console.log(`Install prompt was: ${result.outcome}`);
        disableInAppInstallPrompt();
    }

    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "20px", width: 'calc(100%-40px)' }}>
            <div className="notice-card" style={{ width: "50%" }}
                onClick={() => installPWA()}>
                <h4>웹 앱</h4>
                <p>홈화면에 쏙 아이콘을 추가할 수 있어요 (애플 기기인 경우 권장)</p>
            </div>
            <div className="notice-card" style={{ width: "50%" }}
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.icecream.sungilmeal', '_blank')}>
                <h4>안드로이드 앱</h4>
                <p>좀 더 쾌적하고 빠르게 쏙을 실행할 수 있어요.</p>
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

export default installCards;
