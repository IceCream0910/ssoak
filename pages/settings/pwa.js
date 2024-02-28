"use client";
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../../components/common/headTag'
import Spacer from '../../components/common/spacer';
import IonIcon from '@reacticons/ionicons';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Community() {
    const router = useRouter();

    return (
        <>
            <HeadTag title={'웹 앱 설치'} />
            <Toaster />

            <main>
                <header>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <IonIcon name="chevron-back" onClick={() => router.back()} style={{ fontSize: '25px', cursor: 'pointer' }} />&nbsp;웹 앱 설치
                    </div>

                </header>
                <Spacer y={70} />
                <h3>iOS 및 iPadOS</h3>
                1. 브라우저 하단 또는 상단에서 공유 메뉴를 엽니다.<br />
                2. 홈 화면에 추가를 클릭합니다.<br />
                3. 앱 이름을 확인합니다. 이름은 사용자가 수정할 수 있습니다.<br />
                4. 추가를 클릭합니다. iOS 및 iPadOS에서는 웹사이트 및 PWA에 대한 북마크가 홈 화면에서 동일하게 표시됩니다.<br />
                <Spacer y={20} />
                <video controls style={{ width: '100%', borderRadius: '15px' }}>
                    <source src="https://web.dev/static/learn/pwa/installation/video/RK2djpBgopg9kzCyJbUSjhEGmnw1/UhWxRAtIB6KQpbMYnDSe.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <Spacer y={20} />
                <hr style={{ opacity: .1 }} />
                <Spacer y={10} />
                <h3>데스크톱</h3>
                데스크톱 PWA 설치는 현재 Linux, Windows, macOS, Chromebook의 Chrome 및 Microsoft Edge에서 지원됩니다.<br />
                <Spacer y={20} />
                <img style={{ width: '100%', borderRadius: '15px' }} src="https://web.dev/static/learn/pwa/installation/image/chrome-edge-desktop-th-e88db78e0ba4d_1920.png?hl=ko" />
                <Spacer y={20} />
                <hr style={{ opacity: .1 }} />

                <Spacer y={10} />
                <h3>안드로이드</h3>
                Android에서는 PWA 설치 메시지가 기기 및 브라우저에 따라 다릅니다. 사용자에게 표시될 수 있는 항목은 다음과 같습니다.<br />
                <Spacer y={20} />
                <img style={{ width: '100%', borderRadius: '15px' }} src="https://web.dev/static/learn/pwa/installation/image/mini-info-bar-installati-ccdb28e301b54_1920.png?hl=ko" />

                <Spacer y={100} />
            </main >

            <style jsx>{`
            @media screen and (max-width: 768px) {
                main {
                    width: calc(100% + 40px);
                }
            }

            header {
                position: fixed;
                right: 0;
                top: 0;
                z-index: 99;
                display: flex;
                padding: 20px;
                align-items: center;
                backdrop-filter: blur(15px) saturate(200%);
                -webkit-backdrop-filter: blur(15px) saturate(200%);
                background-color: var(--background-blur);
                width: calc(100% - 40px);
            }
            
            @media screen and (min-width: 768px) {
                header {
                    width: 75%;
                }
            }
            `}
            </style>
        </>
    )
}