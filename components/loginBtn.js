import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from "next-auth/react";
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'

export function LoginBtn() {
    const router = useRouter();
    const { data: session } = useSession();
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <button onClick={() => setModalOpen(true)}>로그인</button>

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
