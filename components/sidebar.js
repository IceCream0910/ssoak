import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from "next-auth/react";
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'

export function Sidebar() {
    const router = useRouter();
    const currentPath = router.asPath;

    const { data: session } = useSession();
    const [modalOpen, setModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const db = firestore;

    useEffect(() => {
        if (session) {
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    if (doc.data().isAdmin) setIsAdmin(doc.data().isAdmin || false);
                }
            }).catch((error) => {
                console.error(error)
            });
        }
    }, [session]);


    return (
        <>
            <div className="navigation-sidebar sidebar-component pc">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Image src="/favicon.ico" width="50" height="50" />
                    <h4>유니터뷰</h4>
                </div>

                <br></br>
                <div style={{ overflowY: 'auto' }}>
                    <div className={currentPath === '/' ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/')}>
                        <h3>내 생기부</h3>
                    </div>
                    <div className={currentPath === '/practice' ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/practice')}>
                        <h3>답변 작성</h3>
                    </div>
                    <div className={currentPath === '/univs' ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/univs')}>
                        <h3>대학별 정보</h3>
                    </div>
                    <div className={currentPath === '/mock' ? "list-item active" : "list-item"}
                        onClick={() => router.replace('/mock')}>
                        <h3>AI 모의면접</h3>
                    </div>
                    {isAdmin &&
                        <div className={currentPath === '/admin' ? "list-item active" : "list-item"}
                            onClick={() => router.replace('/admin')}>
                            <h3>학생 관리</h3>
                        </div>}

                    <div style={{ position: 'absolute', bottom: '30px' }}>
                        <div style={{ display: 'flex', gap: "20px", alignItems: 'center' }}>
                            {session &&
                                <><button className='red' onClick={() => [signOut()]}>로그아웃</button></>
                            }
                            <button className="transparent" onClick={() => window.open("https://slashpage.com/uniterview", '_blank')}><IonIcon name='notifications' style={{ fontSize: '18px' }} /></button>
                        </div>
                        <br></br>
                        <div style={{ display: 'flex', fontSize: '12px', alignContent: 'center', opacity: '0.8' }}>
                            <a href="https://slashpage.com/uniterview/privacy" target="_blank">개인정보처리방침</a>&nbsp;|&nbsp;<a href="https://slashpage.com/uniterview/forum" target="_blank">오류 제보</a>
                        </div>
                        <span style={{ fontSize: '12px', opacity: '0.8' }}>© 2023 Yun Tae In</span>
                    </div>
                </div>
                <br></br>
            </div>

            <div className="navigation-sidebar sidebar-component mobile">
                <a className={currentPath === '/' ? "active" : ""}
                    onClick={() => router.replace('/')}>
                    <IonIcon name={currentPath === '/' ? "document-text" : "document-text-outline"} style={{ fontSize: '27px' }} />
                    <span>내 생기부</span>
                </a>
                <a className={currentPath === '/practice' ? "active" : ""}
                    onClick={() => router.replace('/practice')}>
                    <IonIcon name={currentPath === '/practice' ? "create" : "create-outline"} style={{ fontSize: '27px' }} />
                    <span>답변 작성</span>
                </a>
                <a className={currentPath === '/univs' ? "active" : ""}
                    onClick={() => router.replace('/univs')}>
                    <IonIcon name={currentPath === '/univs' ? "layers" : "layers-outline"} style={{ fontSize: '27px' }} />

                    <span>대학별 정보</span>
                </a>
                <a className={currentPath === '/mock' ? "active" : ""}
                    onClick={() => router.replace('/univs')}>
                    <IonIcon name={currentPath === '/mock' ? "easel" : "easel-outline"} style={{ fontSize: '27px' }} />
                    <span>모의면접</span>
                </a>
            </div>

            <BottomSheet open={modalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setModalOpen(false)}>
                <div className="bottom-sheet">
                    <div>
                        <h3>로그인하고 시작하세요</h3>
                        <div style={{ display: 'flex', alignItems: "center", gap: '10px' }}>
                            <Image onClick={() => signIn("kakao", { callbackUrl: "/login" })} src="/kakao_login.png" alt="kakao" width={45} height={45} />
                            <Image onClick={() => signIn("naver", { callbackUrl: "/login" })} src="/naver_login.png" alt="naver" width={50} height={50} />
                        </div>
                        <br></br>
                        <label style={{ opacity: '0.5', fontSize: '13px' }}>로그인 시 <a href="https://slashpage.com/uniterview/privacy" target="_blank" style={{ textDecoration: 'underline' }}>개인정보 처리방침</a>에 동의하는 것으로 간주합니다.</label>
                        <br></br><br></br>
                    </div>
                    <button onClick={() => setModalOpen(false)}>닫기</button>

                </div>
            </BottomSheet>
        </>
    );
}
