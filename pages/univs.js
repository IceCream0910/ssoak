import Head from "next/head";
import styles from '../styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import IonIcon from '@reacticons/ionicons'
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
export default function Upload() {
    const { data: session } = useSession();
    const router = useRouter();

    const [universitiesData, setUniversitiesData] = useState(null);
    const [universities, setUniversities] = useState([]);
    const [univAddModalOpen, setUnivAddModalOpen] = useState(false);
    const [univAddModalInput, setUnivAddModalInput] = useState('');
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);

    const departmentInput = useRef(null);

    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    setUniversitiesData(doc.data().universities || []);
                }
            }).catch((error) => {
                console.error(error)
            });
        } else {
            router.replace('/');
        }
    }, [session]);

    useEffect(() => {
        console.log(universitiesData);
        if (universitiesData) {
            let keys = universitiesData.map(item => Object.keys(item).toString());
            setUniversities(keys);
            save();
        }
    }, [universitiesData])

    function addUnivToList() {
        setUniversitiesData((prev) => {
            const updatedData = [...prev, { [univAddModalInput]: {} }];
            return updatedData;
        });
        setUnivAddModalInput('');
        setUnivAddModalOpen(false);
    }

    function deleteUniversity(key) {
        if (confirm('정말 삭제하시겠습니까?')) {
            setUniversitiesData((prev) => {
                const updatedData = [...prev];
                const indexToDelete = updatedData.findIndex((item) => Object.keys(item)[0] === key);
                if (indexToDelete !== -1) {
                    updatedData.splice(indexToDelete, 1);
                }

                return updatedData;
            });
        }

    }


    function selectUnivListItem(index) {
        setSelectedItemIndex(index);
    }

    function save() {
        if (session.user?.id) {
            updateDoc(doc(db, "users", session.user?.id), {
                universities: universitiesData
            }).then(() => {
                console.log("Document written with ID: ", session.user?.id);
            }).catch((error) => {
                console.error("Error adding document: ", error);
            });
        }
    }

    return (
        <>
            <Toaster />
            <Head>
                <title>유니터뷰 - 대학별 예상 질문</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main}`}>

                <header>
                    <div className="header-left">
                        <IonIcon name='chevron-back-outline' onClick={() => router.replace('/')} /> <h3 className="header-title">대학별 예상 질문</h3>
                    </div>
                    <div className="header-right"> </div>
                </header>


                <br></br><br></br><br></br>
                <div className="outer-sidebar" id="univInfo">
                    <div className="form-box">지원학과/학부
                        <input placeholder="학과 또는 학부 이름" ref={departmentInput}></input>
                    </div>

                    <div className="form-box">면접 평가 반영 요소
                        <input placeholder="형식 자유. 반영비율은 기재하지 않아도 됨" ref={departmentInput}></input>
                    </div>

                    <div className="form-box">지원학과/학부 교과과정
                        <textarea placeholder="대학별 홈페이지에서 교과과정 확인 후 기재. 형식 자유." ref={departmentInput}></textarea>
                    </div>

                    <button>저장</button>

                    <hr></hr><hr></hr><hr></hr><hr></hr>
                    <h3>입력한 내용을 기반으로 질문을 생성해봤어요.</h3>

                    <div id="practice-container" style={{ display: 'flex', gap: '50px' }}>
                        <div className="analysis-left analysis-container" style={{ width: '100%', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                <h1 style={{ marginTop: '5px', color: '#5272ff' }}>Q.</h1>
                                <h4>ㅇㅇ</h4>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                <h1 style={{ marginTop: '5px', color: '#5272ff' }}>A.</h1>
                                <textarea
                                    style={{ background: 'none', width: '100%', padding: '20px' }}
                                    className="answer-textarea"
                                    spellCheck="false"
                                    autoComplete="off"
                                />
                            </div>
                            <button style={{ float: 'right', width: 'fit-content' }}>저장</button>
                        </div>
                    </div>
                </div>

                <div className="navigation-sidebar">
                    <br></br>
                    <div style={{ overflowY: 'auto' }}>
                        {universities && universities.map((item, index) => {
                            return (
                                <div key={index} className={selectedItemIndex === index ? "list-item active" : "list-item"} onClick={() => selectUnivListItem(index)}>
                                    <h3>{item}</h3>
                                    <button style={{ float: 'right' }} className="transparent" onClick={() => deleteUniversity(item)}><IonIcon name='close' /></button>
                                </div>
                            )
                        })
                        }
                    </div>
                    <br></br>
                    <button onClick={() => setUnivAddModalOpen(true)}><IonIcon name="add" />&nbsp;대학 추가하기</button>
                </div>

                <BottomSheet open={univAddModalOpen} expandOnContentDrag={false} onDismiss={() => [setUnivAddModalOpen(false),]}>
                    <div className="bottom-sheet">
                        <h3>대학 추가하기</h3>
                        <input placeholder="대학명을 입력하세요" value={univAddModalInput} onChange={(e) => setUnivAddModalInput(e.target.value)}></input>
                        <button onClick={() => addUnivToList()}>추가</button>
                    </div>
                </BottomSheet>

            </main >
        </>
    )
}
