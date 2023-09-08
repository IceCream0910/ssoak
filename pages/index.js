import Head from "next/head";
import styles from '@/styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Image from 'next/image'
import { Router, useRouter } from "next/router";
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import toast, { Toaster } from 'react-hot-toast';
import IonIcon from "@reacticons/ionicons";

export default function Home() {
  const { data: session } = useSession();
  const route = useRouter();
  const [modalOpen, setModalOpen] = useState(false);


  return (
    <>
      <Toaster />
      <Head>
        <title>유니터뷰</title>
        <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main}`}>
        <header>
          <div className="header-left">

            <h3>유니터뷰 <span className="badge">beta</span></h3>
          </div>
          <div className="header-right">
            <button className="transparent" onClick={() => window.open("https://slashpage.com/uniterview", '_blank')}><IonIcon name='notifications' style={{ fontSize: '18px' }} /></button>
            {session ?
              <><button onClick={() => [signOut()]}>로그아웃</button></>
              :
              <button onClick={() => setModalOpen(true)}>로그인</button>
            }
          </div>
        </header>
        <br></br><br></br><br></br>
        {session &&
          <>
            <h2>{session.user?.name} 님, 반가워요!</h2>

            <div className="main-step-container">
              <div className="main-step-item" onClick={() => route.push('/my')}>
                <h4>STEP 1.</h4>
                <h2>내 생기부 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='document-text' /></div>
              </div>
              <div className="main-step-item" onClick={() => route.push('/generate')}>
                <h4>STEP 2.</h4>
                <h2>예상 질문 생성 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='chatbubble-ellipses' /></div>
              </div>
              <div className="main-step-item" onClick={() => route.push('/practice')} style={{ border: 'none' }}>
                <h4>STEP 3.</h4>
                <h2>답변 작성 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='sparkles' /></div>
              </div>
            </div>

          </>}

        {!session && <>
          <h2>환영합니다!<br></br>로그인하고 시작해보세요.</h2>
          <button onClick={() => setModalOpen(true)}>로그인</button>
        </>}

        <br></br><br></br><br></br><br></br><br></br><br></br>

        <footer>
          © 2023. All rights reserved Yun Tae In.<br></br><br></br>
          <div style={{ display: 'flex', alignContent: 'center', opacity: '0.8' }}>
            <a href="https://slashpage.com/uniterview/forum" target="_blank">공지사항</a>&nbsp;|&nbsp;<a href="https://slashpage.com/uniterview/j4z7pvx2k5g652ek8653" target="_blank">오류 제보</a>&nbsp;|&nbsp;<a href="https://slashpage.com/uniterview/j4z7pvx2k54gq2ek8653" target="_blank">사용 가이드</a>
          </div>
          <br></br>
          <div style={{ display: 'flex', alignContent: 'center', opacity: '0.5', float: 'right', fontSize: 13 }}>
            <p>AI Powered by OpenAI</p>&nbsp;&nbsp;&nbsp;<Image src="/openai-white-logomark.png" width={30} height={30} alt="openai" style={{ marginTop: '5px' }} />
            <br></br> <br></br> <br></br> <br></br> <br></br>
          </div>
        </footer>

      </main>
      <BottomSheet open={modalOpen} expandOnContentDrag={true} onDismiss={() => setModalOpen(false)}>
        <div className="bottom-sheet">
          <div>
            <h3>로그인하고 시작하세요</h3>
            <div style={{ display: 'flex', alignItems: "center", gap: '10px' }}>
              <Image onClick={() => signIn("kakao", { callbackUrl: "/login" })} src="/kakao_login.png" alt="kakao" width={45} height={45} />
              <Image onClick={() => signIn("naver", { callbackUrl: "/login" })} src="/naver_login.png" alt="naver" width={50} height={50} />
            </div>
            <br></br>
          </div>
          <button onClick={() => setModalOpen(false)}>닫기</button>

        </div>
      </BottomSheet>
    </>
  )
}
