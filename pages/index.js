import Head from "next/head";
import styles from '../styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from 'next/image'
import { Router, useRouter } from "next/router";
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import toast, { Toaster } from 'react-hot-toast';
import IonIcon from "@reacticons/ionicons";

import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function Home() {
  const { data: session } = useSession();
  const route = useRouter();
  const [isSplashOpen, setIsSplashOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [ddaySchoolName, setDdaySchoolName] = useState('');
  const [ddayDate, setDdayDate] = useState(null);
  const [ddayText, setDdayText] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [ddayModalOpen, setDdayModalOpen] = useState(false);

  const [isAgreePolicy, setIsAgreePolicy] = useState(false);

  const db = firestore;

  useEffect(() => {
    if (!session) {
      setIsSplashOpen(true);
      setTimeout(() => {
        setIsSplashOpen(false);
      }, 3000)
    }
    if (!document.querySelector(".adfit1")?.querySelector("ins")) {
      const ins = document.createElement("ins");
      const scr = document.createElement("script");
      ins.className = "kakao_ad_area";
      ins.style.display = "none";
      ins.style.width = "100%";
      scr.async = true;
      scr.type = "text/javascript";
      scr.src = "//t1.daumcdn.net/kas/static/ba.min.js";
      ins.setAttribute("data-ad-width", "300");
      ins.setAttribute("data-ad-height", "250");
      ins.setAttribute("data-ad-unit", "DAN-l3P0JEgce2Sq7xmR");
      document.querySelector(".adfit")?.appendChild(ins);
      document.querySelector(".adfit")?.appendChild(scr);
    }

    if (!document.querySelector(".adfit2")?.querySelector("ins")) {
      const ins = document.createElement("ins");
      const scr = document.createElement("script");
      ins.className = "kakao_ad_area";
      ins.style.display = "none";
      ins.style.width = "100%";
      scr.async = true;
      scr.type = "text/javascript";
      scr.src = "//t1.daumcdn.net/kas/static/ba.min.js";
      ins.setAttribute("data-ad-width", "728");
      ins.setAttribute("data-ad-height", "90");
      ins.setAttribute("data-ad-unit", "DAN-vp89I5gsZLpfd8Bp");
      document.querySelector(".adfit2")?.appendChild(ins);
      document.querySelector(".adfit2")?.appendChild(scr);
    }
  }, []);

  useEffect(() => {
    if (session) {
      const docRef = doc(db, "users", session.user?.id);
      getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          setDdaySchoolName(doc.data().ddayName);
          setDdayDate(doc.data().ddayDate);
          if (doc.data().isAdmin) setIsAdmin(doc.data().isAdmin || false);
        }
      }).catch((error) => {
        console.error(error)
      });
    }
  }, [session]);


  useEffect(() => { //dday 갱신
    if (ddaySchoolName && ddayDate) {
      const todayForDday = new Date();
      todayForDday.setHours(23, 59, 59, 999);
      const convertedDdayDate = new Date(ddayDate);
      const gap = convertedDdayDate.getTime() - todayForDday.getTime();
      const ddayResult = Math.ceil(gap / (1000 * 60 * 60 * 24));
      if (ddayResult == 0) {
        setDdayText(`D-DAY`);
      } else if (ddayResult < 0) {
        setDdayText(`D+${-(ddayResult)}`);
      } else {
        setDdayText(`D-${ddayResult}`);
      }
    }
  }, [ddaySchoolName, ddayDate]);


  function saveDday() {
    if (ddaySchoolName && ddayDate) {
      setDdayModalOpen(false);
      const todayForDday = new Date();
      todayForDday.setHours(23, 59, 59, 999);
      const convertedDdayDate = new Date(ddayDate);
      const gap = convertedDdayDate.getTime() - todayForDday.getTime();
      const ddayResult = Math.ceil(gap / (1000 * 60 * 60 * 24));
      if (ddayResult == 0) {
        setDdayText(`D-DAY`);
      } else if (ddayResult < 0) {
        setDdayText(`D+${-(ddayResult)}`);
      } else {
        setDdayText(`D-${-(ddayResult * -1)}`);
      }

      if (session.user?.id) { //user db에 저장
        updateDoc(doc(db, "users", session.user?.id), {
          ddayName: ddaySchoolName,
          ddayDate: ddayDate
        }).then(() => {
          console.log("Document written with ID: ", session.user?.id);
          toast.success('저장했어요');
        }).catch((error) => {
          console.error("Error adding document: ", error);
          toast.error('저장에 실패했어요');
        });
      }

    } else {
      toast.error('모든 항목을 입력해주세요.')
    }
  }


  return (
    <>
      <Toaster />
      <Head>
        <title>유니터뷰</title>
        <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isSplashOpen && <div className="splash-screen">
        <Image src='/loader.gif' width={50} height={50} alt="splash-icon"></Image>
      </div>
      }

      <main className={`${styles.main}`}>
        <header>
          <div className="header-left">

            <h3>유니터뷰</h3>
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
            {isAdmin && <button onClick={() => route.push('/admin')}>학생 관리</button>}
            <div className="main-step-container">
              <div className="main-step-item transparent" onClick={() => setDdayModalOpen(true)}>
                <h4>{ddaySchoolName ? ddaySchoolName + ' 면접일' : '가장 가까운 면접일을 설정해보세요'}</h4>
                <h2>{ddayDate ? ddayText : "D-??"}</h2>
                <div className="icon" style={{ opacity: 0.3, fontSize: 50 }}><IonIcon name='chevron-forward' /></div>
              </div>


              <div className="main-step-item" onClick={() => route.push('/univs')}>
                <h4></h4>
                <h2>대학별 예상 질문 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='layers' /></div>
              </div>

              <div className="main-step-item" onClick={() => route.push('/my')}>
                <h2>내 생기부 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='document-text' /></div>
              </div>


            </div>
            <br></br>

            <div className="main-step-container">
              <div className="main-step-item" onClick={() => route.push('/generate')}>
                <h2>예상 질문 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='chatbubble-ellipses' /></div>
              </div>

              <div className="main-step-item" onClick={() => route.push('/practice')}>
                <h2>답변 작성 <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='file-tray-stacked' /></div>
              </div>


              <div className="main-step-item" onClick={() => route.push('/mock')} id="only-pc">
                <h2>AI 모의면접 <span className="badge">beta</span> <IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h2>
                <div className="icon"><IonIcon name='timer-outline' /></div>
              </div>
            </div>

          </>}


        {!session && <>
          <h2>환영합니다!<br></br>로그인하고 시작해보세요.</h2>
          <button onClick={() => setModalOpen(true)}>로그인</button>
        </>}

        <br></br><br></br><br></br><br></br>

        <div className="adfit1" id="only-mobile"></div>
        <div className="adfit2" id="only-pc"></div>

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
            <label style={{ opacity: '0.5', fontSize: '13px' }}>로그인 시 <a href="https://slashpage.com/uniterview/privacy" target="_blank" style={{ textDecoration: 'underline' }}>개인정보 처리방침</a>에 동의하는 것으로 간주합니다.</label>
            <br></br><br></br>
          </div>
          <button onClick={() => setModalOpen(false)}>닫기</button>

        </div>
      </BottomSheet>

      <BottomSheet open={ddayModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => setDdayModalOpen(false)}>
        <div className="bottom-sheet">
          <h3>면접일 설정</h3>
          <input placeholder="대학명" value={ddaySchoolName} onChange={(e) => setDdaySchoolName(e.target.value)}></input>
          <input type="date" placeholder="면접 일자" value={ddayDate} onChange={(e) => setDdayDate(e.target.value)}></input>
          <button onClick={() => saveDday()}>저장</button>
        </div>

      </BottomSheet>
    </>
  )
}
