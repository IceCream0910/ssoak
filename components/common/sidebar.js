import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import 'react-spring-bottom-sheet/dist/style.css'
import Spacer from './spacer';
import moment from 'moment';

export function Sidebar() {
    const router = useRouter();
    const currentPath = router.asPath;
    return (
        <>
            <div className="navigation-sidebar sidebar-component pc">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Image onClick={() => router.replace('/')} src="/icons/icon-transparent.png" width="30" height="30"
                        style={{ filter: 'grayscale(1)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: '20px', gap: '10px' }}>
                    <div className={currentPath === '/' ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/')}>
                        <IonIcon name={currentPath === '/' ? "planet" : "planet-outline"} style={{ fontSize: '18px' }} />
                        <h4>피드</h4>
                    </div>
                    <div className={currentPath.includes('/community') ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/community')}>
                        <IonIcon name={currentPath.includes('/community') ? "chatbubbles" : "chatbubbles-outline"} style={{ fontSize: '18px' }} />
                        <h4>커뮤니티</h4>
                    </div>
                    <div className={currentPath === '/todo' ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/todo')}>
                        <IonIcon name={currentPath === '/todo' ? "file-tray-full" : "file-tray-full-outline"} style={{ fontSize: '18px' }} />
                        <h4>할일</h4>
                    </div>
                    <div className={currentPath === '/settings' ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/settings')}>
                        <IonIcon name={currentPath === '/settings' ? "settings" : "settings-outline"} style={{ fontSize: '18px' }} />
                        <h4>설정</h4>
                    </div>
                </div>
                <br></br>
            </div>

            <div className="navigation-sidebar sidebar-component mobile">
                <a className={currentPath === '/' ? "active" : ""}
                    onClick={() => router.replace('/')}>
                    <IonIcon name={currentPath === '/' ? "planet" : "planet-outline"} style={{ fontSize: '27px' }} />
                    <span>피드</span>
                </a>
                <a className={currentPath.includes('/community') ? "active" : ""}
                    onClick={() => router.replace('/community')}>
                    <IonIcon name={currentPath.includes('/community') ? "chatbubbles" : "chatbubbles-outline"} style={{ fontSize: '27px' }} />
                    <span>커뮤니티</span>
                </a>
                <a className={currentPath === '/todo' ? "active" : ""}
                    onClick={() => router.replace('/todo')}>
                    <IonIcon name={currentPath === '/todo' ? "file-tray-full" : "file-tray-full-outline"} style={{ fontSize: '27px' }} />
                    <span>할일</span>
                </a>
                <a className={currentPath === '/settings' ? "active" : ""}
                    onClick={() => router.replace('/settings')}>
                    <IonIcon name={currentPath === '/settings' ? "settings" : "settings-outline"} style={{ fontSize: '27px' }} />
                    <span>설정</span>
                </a>
            </div>
        </>
    );
}
