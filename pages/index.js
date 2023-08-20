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
              <div className="main-step-item" onClick={() => route.push('/practice')}>
                <h4>STEP 3.</h4>
                <h2>면접 대비 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='sparkles' /></div>
              </div>
            </div>

          </>}

        {!session && <>
          <h2>환영합니다!<br></br>로그인하고 시작해보세요.</h2>
        </>}


      </main>
      <BottomSheet open={modalOpen} expandOnContentDrag={true} onDismiss={() => setModalOpen(false)}>
        <div className="bottom-sheet">
          <div>
            <h3>로그인하고 시작하세요</h3>
            <div style={{ display: 'flex', alignItems: "center", gap: '10px' }}>
              <Image onClick={() => signIn("kakao", { callbackUrl: "/login" })} src="/kakao_login.png" alt="kakao" width={45} height={45} />
              <Image onClick={() => [toast('네이버의 승인이 완료되면 지원될 예정입니다')]} src="/naver_login.png" alt="naver" width={50} height={50} />
            </div>
            <br></br>
          </div>
          <button onClick={() => setModalOpen(false)}>닫기</button>

        </div>
      </BottomSheet>
    </>
  )
}
