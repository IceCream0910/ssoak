"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../components/common/headTag'
import Meal from '../components/feed/meal';
import Timetable from '../components/feed/timetable';
import LinkCards from '../components/feed/linkCards';
import InstallCards from '../components/feed/installCards';

import Schedule from '../components/feed/schedule';
import NewsLetter from '../components/feed/newsletter';
import Notice from '../components/feed/notice';
import HomepageNotices from '../components/feed/homepageNotices';
import Spacer from '../components/common/spacer';
import { getCurrentPeriod } from '../utils/date';
import moment from 'moment';
import Image from 'next/image';

import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'
import IonIcon from '@reacticons/ionicons';

export default function Feed() {
    const router = useRouter();
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [date, setDate] = useState(null);
    const [mealCardTitle, setMealCardTitle] = useState('급식');
    const [timetableCardTitle, setTimetableCardTitle] = useState('시간표');
    const [grade, setGrade] = useState(1);
    const [classNum, setClassNum] = useState(1);
    const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
    const [isAppModalOpen, setIsAppModalOpen] = useState(false);


    useEffect(() => {
        // localStroage에서 grade와 classNum 가져와서 grade와 classNum으로 설정
        let savedGrade = localStorage.getItem('sungil_grade24');
        let savedClassNum = localStorage.getItem('sungil_classNum24');
        if (!savedGrade || !savedClassNum) {
            savedGrade = 1;
            savedClassNum = 1;
            openWelcomeModal();
        };
        setGrade(savedGrade);
        setClassNum(savedClassNum);

        const day = moment(new Date()).day();
        if (day === 6) {  //주말
            // 다음주 월요일로 selectedDate를 변경
            let nextMonday = moment().add(1, 'weeks').startOf('week').add(1, 'days');
            setDate(nextMonday.format('YYYYMMDD'));

            setTimetableCardTitle(`미리보는 월요일 시간표`);
            setMealCardTitle(`월요일에 먹게 될 급식`);
        } else if (day === 0) { //일요일
            // 내일로 selectedDate를 변경
            let tomorrow = moment().add(1, 'days');
            setDate(tomorrow.format('YYYYMMDD'));
            setTimetableCardTitle(`미리보는 월요일 시간표`);
            setMealCardTitle(`월요일에 먹게 될 급식`);
        } else {
            setDate(moment().format('YYYYMMDD'));
            setTimetableCardTitle(`오늘 시간표`);
            setMealCardTitle(`오늘의 급식`);
        }

        const currentPeriod = getCurrentPeriod();
        if (currentPeriod == 'null' || currentPeriod == 8) { //종례 후
            if (day === 5) { //금요일
                // 다음주 월요일로 selectedDate를 변경
                let nextMonday = moment().add(1, 'weeks').startOf('week').add(1, 'days');
                setDate(nextMonday.format('YYYYMMDD'));
                setTimetableCardTitle(`다음주 월요일 시간표`);
                setMealCardTitle(`댜음 주 월요일에 먹게 될 급식`);
            } else { //월~목
                // 내일로 selectedDate를 변경
                if (day === 6 || day === 0) return;
                let tomorrow = moment().add(1, 'days');
                setDate(tomorrow.format('YYYYMMDD'));
                setTimetableCardTitle(`내일 시간표`);
                setMealCardTitle(`내일 먹게 될 급식`);
            }
        }


    }, []);

    useEffect(() => {
        localStorage.setItem('sungil_grade24', grade);
        localStorage.setItem('sungil_classNum24', classNum);
    }, [grade, classNum]);


    const openWelcomeModal = () => {
        setIsWelcomeModalOpen(true);
    }

    const saveWelcomeInfo = () => {
        setIsWelcomeModalOpen(false);
        toast.success('환영합니다!');

        localStorage.setItem('sungil_grade24', grade);
        localStorage.setItem('sungil_classNum24', classNum);
    }

    return (
        <>
            <HeadTag title="피드" />
            <Toaster />

            <main>
                <header style={{ padding: '20px 0 10px 10px' }}>
                    <Image src="/icons/icon-transparent.png" width="30" height="30"
                        style={{ filter: 'grayscale(1)' }} />
                </header>
                <Spacer y={10} />

                <Notice />
                <Spacer y={20} />
                <Meal date={date} title={mealCardTitle} />
                <Timetable date={date} grade={grade} classNum={classNum} title={timetableCardTitle} />
                <Spacer y={30} />
                <LinkCards />
                <Spacer y={10} />
                <Schedule date={moment().format('YYYYMMDD')} />
                <Spacer y={20} />
                <HomepageNotices />
                <Spacer y={20} />
                <NewsLetter />
                <Spacer y={100} />
            </main >

            <BottomSheet open={isWelcomeModalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setIsWelcomeModalOpen(false)}>
                <div className="bottom-sheet">
                    <h2>반가워요!</h2>
                    <Spacer y={10} />
                    <p style={{ opacity: .7, margin: 0 }}>
                        쏙은 <b>경기 성남 성일고</b>의 정보만을 제공해요.<br />
                        그럼, 시작하기 전에 학년과 반을 알려주세요.</p>
                    <Spacer y={30} />
                    <h2>
                        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                        </select> 학년&nbsp;&nbsp;&nbsp;

                        <select value={classNum} onChange={(e) => setClassNum(e.target.value)}>
                            {Array.from({ length: 12 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>{index + 1}</option>
                            ))}
                        </select> 반
                    </h2>
                    <Spacer y={20} />
                    <button onClick={() => saveWelcomeInfo()}>확인</button>
                </div>
            </BottomSheet>

            <BottomSheet open={isAppModalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setIsAppModalOpen(false)}>
                <div className="bottom-sheet">
                    <h2>앱 설치</h2>
                    <Spacer y={20} />
                    <InstallCards />

                    <Spacer y={10} />
                    <button onClick={() => setIsAppModalOpen(false)}>닫기</button>
                </div>
            </BottomSheet>

            <style jsx>{`
            select {
                width: fit-content;
                border: none;
                color: var(--text);
                font-size: 1.5rem;
                padding: 5px 10px;
                outline: none;
            }
                @media screen and (min-width: 768px) {
                    header {
                        display:none;
                    }
                }
            `}
            </style>
        </>
    )
}