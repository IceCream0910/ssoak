import Head from "next/head";
import styles from '../styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import IonIcon from '@reacticons/ionicons'
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'

export default function Admin() {
    const { data: session } = useSession();
    const router = useRouter();

    const [users, setUsers] = useState(null);
    const [isOnlyValidUser, setIsOnlyValidUser] = useState(true);

    const [currentUserID, setCurrentUserId] = useState('');
    const [isReadyUserID, setIsReadyUserID] = useState(false);

    const [univsNames, setUnivsNames] = useState(null);
    const [univs, setUnivs] = useState(null);

    const [자동진JSON, set자동진JSON] = useState('');
    const [과세특JSON, set과세특JSON] = useState('');

    const [questions, setQuestions] = useState('');

    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    if (!doc.data().isAdmin) {
                        alert('권한이 없습니다')
                        router.replace('/');
                    } else if (doc.data().isAdmin == true) {
                        getUsers();
                    }
                }
            }).catch((error) => {
                console.error(error)
            });
        } else {
            router.replace('/');
        }
    }, []);

    const getUsers = async () => {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => {
            const userData = doc.data();
            userData.key = doc.id;
            return userData;
        });
        setUsers(userList);
    };


    const handleChangeSelect = (e) => {
        const userId = e.value;
        if (!userId) return;
        setCurrentUserId(userId);
        const docRef = doc(db, "users", userId);
        getDoc(docRef).then((doc) => {
            if (doc.exists()) {
                setUnivsNames(doc.data().universitiesName);
                setUnivs(doc.data().universities);
                set자동진JSON(doc.data().sanggibu_자동진 || null);
                set과세특JSON(doc.data().sanggibu_과세특 || null);
                setQuestions(doc.data().questionsArr || null);
            }
        }).catch((error) => {
            console.error(error)
        });
    }

    useEffect(() => {
        setIsReadyUserID(true);
    }, [currentUserID])



    const handleMemoEdit = (index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;

        let newQuestions = [...questions];
        newQuestions[index].memo = e.value;
        setQuestions(newQuestions);
    }

    function saveQuestion() {
        updateDoc(doc(db, "users", currentUserID), {
            questionsArr: questions,
        }).then(() => {
            console.log("Document written with ID: ", session.user?.id);
            toast.success("저장했어요");
        }).catch((error) => {
            console.error("Error adding document: ", error);
        });
    }

    return (
        <>
            <Toaster />
            <Head>
                <title>유니터뷰 - 학생 관리</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main}`}>

                <header>
                    <div className="header-left">
                        <IonIcon name='chevron-back-outline' onClick={() => router.replace('/')} /> <h3 className="header-title">학생 관리</h3>
                    </div>
                    <div className="header-right"> </div>
                </header>


                <br></br><br></br><br></br>
                <div className="outer-sidebar" id="univInfo">
                    <div className="list-mobile">
                        <input type="checkbox" id="onlyValid" name="onlyValid" checked={isOnlyValidUser} onChange={(e) => setIsOnlyValidUser(e.target.checked)} />
                        <label for="onlyValid"> 생기부 등록된 학생만 보기</label>
                        <br></br><br></br>
                        <select onChange={(e) => handleChangeSelect(e.target)}>
                            <option value='none' selected>학생 선택</option>
                            {users && (
                                isOnlyValidUser ?
                                    users.map((item, index) => {
                                        if (!item.sanggibu_name) return null;
                                        return (
                                            <option value={item.key} key={item.key}>{`${item.sanggibu_name} (${item.email})`}</option>)
                                    })
                                    :
                                    users.map((item, index) => {
                                        return (
                                            <option value={item.key} key={item.key}>{(item.sanggibu_name) ? `${item.sanggibu_name} (${item.email})` : `${item.name} (${item.email})`}</option>
                                        )
                                    })
                            )}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', color: '#d6d2d2', position: 'fixed', background: '#f1f5ff', marginTop: '-10px', width: '100%' }}>
                        <button className="transparent" style={{ paddingLeft: 0 }}><a href="#univs">대학 정보</a></button>|
                        <button className="transparent"><a href="#sanggibu">학생 생기부</a></button>|
                        <button className="transparent"><a href="#qna">예상 질문</a></button>
                    </div>



                    <div id="univs"><hr></hr><br></br><br></br><br></br><br></br><br></br>
                        {
                            univs ? (
                                univs.map((item, index) => (
                                    <div key={index}>
                                        <h3>{univsNames[index]}</h3>
                                        <p>지원학과: {item.department}</p>
                                        <p>예상 면접 시간: {item.time}분</p>
                                        <p>평가 요소: {item.grading}</p>
                                        <p>교과과정: {item.curriculum}</p>
                                        <p>기타: {item.etc}</p>
                                        <hr style={{ border: '#e3e1e1 1px solid' }} />
                                    </div>
                                ))
                            ) : (
                                <h3>지원 대학 정보 및 예상 질문을 입력하지 않았습니다</h3>
                            )
                        }

                    </div>

                    <div id="sanggibu"><br></br><br></br>
                        {(자동진JSON && 과세특JSON) ? <>
                            <hr></hr><br></br><br></br><br></br><br></br><br></br>
                            <h3>자율/동아리/진로</h3>
                            {자동진JSON &&
                                자동진JSON.map((item, index) => {
                                    return (
                                        <div key={index} className="jadongjin-card" id={`${item.grade}학년_${item.title}`}>
                                            <h4>{item.grade}학년 {item.title}</h4>
                                            <textarea
                                                disabled
                                                value={item.content}
                                                spellCheck="false"
                                                autoComplete="off"
                                            />
                                        </div>
                                    )
                                })
                            }

                            <hr></hr>
                            <h3>과목별 세부능력 특기사항</h3>
                            {과세특JSON &&
                                Object.keys(과세특JSON).map((grade) => {
                                    return (
                                        <div key={grade}>
                                            <br></br>
                                            <h3>{grade}학년</h3>
                                            {Object.keys(과세특JSON[grade]).map((category) => {
                                                return (
                                                    <div key={category}>
                                                        {과세특JSON[grade][category].map((item, index) => {
                                                            if (index === 과세특JSON[grade][category].length - 1) {
                                                                return null;
                                                            }
                                                            else if (item.content && item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.')) {
                                                                return (<></>
                                                                );
                                                            }
                                                            return (
                                                                <div key={index} className="sanggibu-card" id={item.content && `${grade}학년_${item.content.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').split(': ')[0]}`}>
                                                                    <textarea
                                                                        disabled
                                                                        value={item.content}
                                                                        spellCheck="false"
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })
                            }

                        </> : <></>}
                    </div>

                    <div id="qna">
                        <hr></hr><br></br><br></br><br></br><br></br><br></br>
                        <h3>예상 질문</h3>

                        {questions && questions.map((item, index) => {
                            if (item.question.length < 2 || !item.question || item.question == "undefined") return null;
                            return (
                                <div key={index} className="analysis-container" style={{ flexDirection: 'column' }}>
                                    <div id="practice-container" style={{ display: 'flex', gap: '50px' }}>
                                        <div className="analysis-left">
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                                <h1 style={{ marginTop: '5px', color: '#5272ff' }}>Q.</h1>
                                                <h4>{item.question}</h4>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                                <h1 style={{ marginTop: '5px', color: '#5272ff' }}>A.</h1>
                                                <textarea
                                                    disabled
                                                    className="answer-textarea"
                                                    value={item.answer}
                                                    spellCheck="false"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <div className="analysis-right">
                                            <br></br><span style={{ marginLeft: '10px' }}>메모 (교사가 수정 가능)</span>
                                            <textarea
                                                className="memo-textarea"
                                                value={item.memo}
                                                onChange={(e) => handleMemoEdit(index, e.target)}
                                                spellCheck="false"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <button className="transparent" style={{ float: 'right' }} onClick={() => saveQuestion()}><IonIcon name="checkmark-done-outline" />&nbsp;&nbsp;저장</button>
                                    </div>
                                </div>
                            )
                        })
                        }
                    </div>
                </div>

                <div className="navigation-sidebar">
                    <br></br>
                    <input type="checkbox" id="onlyValid" name="onlyValid" checked={isOnlyValidUser} onChange={(e) => setIsOnlyValidUser(e.target.checked)} />
                    <label for="onlyValid"> 생기부 등록된 학생만 보기</label>
                    <br></br><br></br>
                    <select onChange={(e) => handleChangeSelect(e.target)}>
                        <option value='none' selected>학생 선택</option>
                        {users && (
                            isOnlyValidUser ?
                                users.map((item, index) => {
                                    if (!item.sanggibu_name) return null;
                                    return (
                                        <option value={item.key} key={item.key}>{`${item.sanggibu_name} (${item.email})`}</option>)
                                })
                                :
                                users.map((item, index) => {
                                    return (
                                        <option value={item.key} key={item.key}>{(item.sanggibu_name) ? `${item.sanggibu_name} (${item.email})` : `${item.name} (${item.email})`}</option>
                                    )
                                })
                        )}
                    </select>
                </div>

            </main >
        </>
    )
}
