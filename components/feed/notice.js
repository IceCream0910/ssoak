import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import 'react-spring-bottom-sheet/dist/style.css'
import Spacer from '../common/spacer';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'
import { getScheduleData } from '../../utils/schedule';

import { firestore, auth } from "../../firebase/firebase"
import { collection, getDocs, getDoc, doc, query, orderBy, limitToLast, setDoc, endBefore, where } from 'firebase/firestore';


function Notice() {
    const router = useRouter();
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeLink, setNoticeLink] = useState('');

    const fetchNotice = async () => {
        const querySnapshot = await getDocs(query(collection(firestore, "board"), orderBy("createdAt"), where("category", "==", '공지'), limitToLast(1)));
        const tempList = [];

        for (const doc of querySnapshot.docs) {
            let data = doc.data();
            data.id = doc.id;

            tempList.push({
                ...data,
            });
        }

        setNoticeTitle(tempList[0].title);
        setNoticeLink(`/community/${tempList[0].id}`);
    }

    useEffect(() => {
        fetchNotice();
    }, []);

    return (
        <div>
            <div className="card" onClick={() => window.open(noticeLink, '_blank')}>
                📢
                <div><span style={{ opacity: .7 }}>{noticeTitle} <IonIcon name="chevron-forward-outline" style={{ position: "relative", top: "2px" }} /></span></div>
            </div>
            <style jsx>{`
.card {
    display: flex;
    flex-direction: row;
    gap: 10px;
    background-color: var(--secondary-bg);
    font-size: 14px;
    font-weight: 400;
    overflow: hidden;
    width: 100%;
    border-radius: 15px;
    padding: 10px 20px 13px 15px;
    border: 1px solid rgba(255, 255, 255, .125);
    -webkit-transition: .5s;
    -moz-transition: .5s;
    -o-transition: .5s;
    transition: .5s;
}

.card:active {
    transform: scale(0.98);
}

.card-title {
    opacity: 0.6;
    font-size: 14px;
}

            `}</style>
        </div >
    );
}

export default Notice;
