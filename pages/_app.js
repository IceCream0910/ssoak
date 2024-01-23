import '../styles/globals.css'
import React, { useEffect, useState } from "react";
import router from "next/router";
import Image from "next/image";
import { Sidebar } from "../components/common/sidebar";

import toast, { Toaster } from 'react-hot-toast';
import { firestore, auth } from "../firebase/firebase"
import { collection, getDocs, getDoc, doc, query, orderBy, limitToLast, setDoc, endBefore, where } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect, signInWithCredential } from 'firebase/auth';

export default function App({ Component, pageProps }) {

  useEffect(() => {
    window.toast = (message) => {
      toast(message);
    }

    window.pushWebviewGoogleLoginToken = (tokenFromApp) => {
      console.log("tokenFromApp : " + tokenFromApp)
      const credential = GoogleAuthProvider.credential(tokenFromApp);
      signInWithCredential(auth, credential)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          updateUserData(user);
        }).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = GoogleAuthProvider.credentialFromError(error);
          alert("로그인 오류 : " + errorMessage);
        });
    }

    if (!window.location.href.includes('/community')) {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      document.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });
      document.addEventListener('selectstart', (e) => {
        e.preventDefault();
      });
    }
  }, []);

  async function updateUserData(user) {
    const query = await getDoc(doc(firestore, 'users', user.uid));
    const data = query.data();

    Android.sendUserIdForFCM(user.uid);

    if (!data) {
      //새로운 유저
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        nickname: user.displayName,
        email: user.email,
        profileImg: Math.floor(Math.random() * 5),
        admin: false
      });

      setMyUser({
        uid: user.uid,
        nickname: user.displayName,
        email: user.email,
        profileImg: Math.floor(Math.random() * 5),
        admin: false
      });
      console.log('새로운 유저 가입됨')
    }

  }

  return (
    <>
      <Toaster />
      <Component {...pageProps} />
      <Sidebar />
    </>
  )
}
