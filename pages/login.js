import Head from "next/head";
import styles from '@/styles/Home.module.css'
import { useSession, signOut, getCsrfToken } from "next-auth/react";
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Auth() {
    const router = useRouter();
    const { data: session } = useSession();

    if (session) {
        console.log(session)
        const db = firestore;
        const userRef = doc(db, "users", session.user?.id);
        const userData = {
            name: session.user?.name || session.user?.email.split('@')[0],
            email: session.user?.email || '',
            lastSession: Timestamp.fromDate(new Date()),
        };

        getDoc(userRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                updateDoc(userRef, userData).then(() => {
                    console.log("Document updated with ID: ", session.user?.id);
                    router.replace("/");
                }).catch((error) => {
                    console.error("Error updating document: ", error);
                });
            } else {
                setDoc(userRef, userData).then(() => {
                    console.log("Document written with ID: ", session.user?.id);
                    router.replace("/");
                }).catch((error) => {
                    console.error("Error adding document: ", error);
                });
            }
        }).catch((error) => {
            console.error("Error getting document: ", error);
        });
    }

    return (
        <div>
            <Head>
                <title>로그인 중...</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </div>
    )
}