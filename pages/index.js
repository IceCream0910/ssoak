import Head from "next/head";
import styles from '@/styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, setDoc } from "firebase/firestore";
import Image from 'next/image'
import { Router, useRouter } from "next/router";


export default function Home() {
  const { data: session } = useSession();
  const route = useRouter();

  return (
    <>
      <Head>
        <title>유니터뷰</title>
        <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main}`}>
        <header>
          <div className="header-left">

            <h3>유니터뷰.</h3>
          </div>
          <div className="header-right">
            {session && <button onClick={() => route.push('/my')}>내 생기부</button>}

            {session ?
              <><button onClick={() => [signOut(), location.reload()]}>로그아웃</button></>
              :
              <button onClick={() => signIn("kakao", { callbackUrl: "/login" })}>카카오 로그인</button>
            }
          </div>
        </header>
        <br></br><br></br><br></br>
        {session &&
          <>
            <h1>{session.user?.name} 님, 반가워요!</h1>
            <button onClick={() => route.push('/generate')}>예상 질문 만들기</button>
            <button onClick={() => route.push('/practice')}>면접 대비</button>
          </>}

        {!session && <>
          <h1>환영합니다!<br></br>로그인하고 시작해보세요.</h1>
        </>}


      </main>
    </>
  )
}
