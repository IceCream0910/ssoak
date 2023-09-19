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

    const [isInit, setIsInit] = useState(false);
    const [updatingIndex, setupdatingIndex] = useState(null);

    const [department, setDepartment] = useState('');
    const [time, setTime] = useState('');
    const [grading, setGrading] = useState('');
    const [curriculum, setCurriculum] = useState('');
    const [etc, setEtc] = useState('');

    const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [modalContent, setModalContent] = useState('');

    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    setUniversities(doc.data().universitiesName || []);
                    setUniversitiesData(doc.data().universities || []);
                    setIsInit(true);
                }
            }).catch((error) => {
                console.error(error)
            });
        } else {
            router.replace('/');
        }
    }, []);

    useEffect(() => {
        if (session) {
            save();
        }
        if (isInit) {
            selectUnivListItem(0)
        }
        if (updatingIndex != null) {
            selectUnivListItem(updatingIndex);
            setupdatingIndex(null);
        }
        setIsInit(false);
    }, [universitiesData, universities]);

    useEffect(() => {
        if (universitiesData) {
            saveUnivInfo();
        }
    }, [questions]);


    function addUnivToList() {
        setupdatingIndex(universities.length)
        setUniversities((prev) => {
            const updatedData = [...prev];
            updatedData.push(univAddModalInput);
            return updatedData;
        });
        setUniversitiesData((prev) => {
            const updatedData = [...prev];
            updatedData.push({
                department: '',
                time: '',
                grading: '',
                curriculum: '',
                etc: '',
                questions: [{ question: '우리 대학에 입학하면 꼭 듣고 싶은 수업이 있나요?', answer: '' }]
            });
            return updatedData;
        });
        setUnivAddModalInput('');
        setUnivAddModalOpen(false);
    }

    function deleteUniversity(key) {
        if (confirm('정말 삭제하시겠습니까?')) {
            setIsInit(true);
            setUniversities((prev) => {
                const updatedData = [...prev];
                const indexToDelete = updatedData.findIndex((item, index) => index === key);
                if (indexToDelete !== -1) {
                    updatedData.splice(indexToDelete, 1);
                }
                return updatedData;
            });
            setUniversitiesData((prev) => {
                const updatedData = [...prev];
                const indexToDelete = updatedData.findIndex((item, index) => index === key);
                if (indexToDelete !== -1) {
                    updatedData.splice(indexToDelete, 1);
                }
                return updatedData;
            });
        }

    }


    function selectUnivListItem(index) {
        setSelectedItemIndex(index);
        if (universitiesData[index]) {
            setDepartment(universitiesData[index].department || '');
            setTime(universitiesData[index].time || '');
            setGrading(universitiesData[index].grading || '');
            setCurriculum(universitiesData[index].curriculum || '');
            setEtc(universitiesData[index].etc || '');
            setQuestions(universitiesData[index].questions || []);
        } else {
            setDepartment('');
            setTime('');
            setGrading('');
            setCurriculum('');
            setEtc('');
            setQuestions([]);
        }
    }

    function save() {
        if (session.user?.id && universitiesData) {
            updateDoc(doc(db, "users", session.user?.id), {
                universitiesName: universities,
                universities: universitiesData
            }).then(() => {
                console.log("Document written with ID: ", session.user?.id);
            }).catch((error) => {
                console.error("Error adding document: ", error);
            });
        }
    }


    function saveUnivInfo() {
        setUniversitiesData((prev) => {
            const updatedData = [...prev];
            updatedData[selectedItemIndex] = {
                department: department,
                time: time,
                grading: grading,
                curriculum: curriculum,
                etc: etc,
                questions: questions
            }
            return updatedData;
        });
    }

    const handleAnswerEdit = (index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;

        let newQuestions = [...questions];
        newQuestions[index].answer = e.value;
        setQuestions(newQuestions);
    }

    function addQuestion() {
        setQuestions((prev) => {
            const newArr = [...prev];
            newArr.unshift({ question: modalContent, answer: '' });
            return newArr;
        });
        setAddQuestionModalOpen(false);
        setModalContent('')
    }

    function deleteQuestion(index) {
        if (confirm('정말 삭제하시겠습니까?')) {
            setQuestions((prev) => {
                const newArr = [...prev];
                newArr.splice(index, 1);
                return newArr;
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
                    <div className="list-mobile">
                        <div style={{ overflowY: 'auto' }}>
                            {universities && universities.map((item, index) => {
                                return (
                                    <div key={index} className={selectedItemIndex === index ? "list-item active" : "list-item"} onClick={() => [window.scrollTo(0, 0), selectUnivListItem(index)]}>
                                        <h3>{item}</h3>
                                        <button style={{ float: 'right' }} className="transparent" onClick={() => deleteUniversity(index)}><IonIcon name='close' /></button>
                                    </div>
                                )
                            })
                            }
                        </div>
                        <br></br>
                        <button onClick={() => setUnivAddModalOpen(true)}><IonIcon name="add" />&nbsp;대학 추가하기</button>
                    </div>


                    {(universities.length > 0) && <>                    <div className="form-box">지원학과/학부
                        <input placeholder="학과 또는 학부 이름" value={department} onChange={(e) => setDepartment(e.target.value)}></input>
                    </div>

                        <div className="form-box">면접 시간(분)
                            <input type="number" placeholder="평균적인 면접 진행 시간. 대학에서 제공하는 자료나 면접 후기 참고." value={time} onChange={(e) => setTime(e.target.value)}></input>
                        </div>

                        <div className="form-box">면접 평가 반영 요소
                            <input placeholder="형식 자유. 반영비율은 기재하지 않아도 됨" value={grading} onChange={(e) => setGrading(e.target.value)}></input>
                        </div>

                        <div className="form-box">지원학과/학부 교과과정
                            <textarea placeholder="대학 홈페이지에서 교과과정 확인 후 기재. 형식 자유." value={curriculum} onChange={(e) => setCurriculum(e.target.value)}></textarea>
                        </div>

                        <div className="form-box">기타
                            <textarea placeholder="기타 참고할만한 특이사항을 입력해보세요." value={etc} onChange={(e) => setEtc(e.target.value)}></textarea>
                        </div>

                        <button onClick={() => [saveUnivInfo(), toast.success('저장했어요')]}>저장</button>

                        <hr></hr><hr></hr><hr></hr><hr></hr>
                        <h3>{universities[selectedItemIndex]}에서 나올만한 질문을 준비해볼까요?</h3>

                        <div id="practice-container" style={{ display: 'flex', flexDirection: 'column' }}>

                            {questions && questions.map((item, index) => {
                                return (
                                    <div className="analysis-left analysis-container" style={{ width: '100%', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                            <h1 style={{ marginTop: '5px', color: '#5272ff' }}>Q.</h1>
                                            <h4>{item.question}</h4>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                            <h1 style={{ marginTop: '5px', color: '#5272ff' }}>A.</h1>
                                            <textarea
                                                style={{ background: 'none', width: '100%', padding: '20px' }}
                                                value={item.answer}
                                                onChange={(e) => handleAnswerEdit(index, e.target)}
                                                className="answer-textarea"
                                                spellCheck="false"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div>
                                            <button className="transparent" onClick={() => deleteQuestion(index)}><IonIcon name="trash-outline" />&nbsp;&nbsp;삭제</button>

                                            <button className="transparent" style={{ float: 'right' }} onClick={() => [saveUnivInfo(), toast.success('저장했어요')]}><IonIcon name="checkmark-done-outline" />&nbsp;&nbsp;저장</button>
                                        </div>
                                    </div>
                                )

                            })}

                        </div>

                        <button onClick={() => setAddQuestionModalOpen(true)}>{universities[selectedItemIndex]} 질문 추가하기</button>

                        <br></br> <br></br> <br></br> <br></br> <br></br>

                    </>
                    }

                </div>

                <div className="navigation-sidebar">
                    <br></br>
                    <div style={{ overflowY: 'auto' }}>
                        {universities && universities.map((item, index) => {
                            return (
                                <div key={index} className={selectedItemIndex === index ? "list-item active" : "list-item"} onClick={() => [window.scrollTo(0, 0), selectUnivListItem(index)]}>
                                    <h3>{item}</h3>
                                    <button style={{ float: 'right' }} className="transparent" onClick={() => deleteUniversity(index)}><IonIcon name='close' /></button>
                                </div>
                            )
                        })
                        }
                    </div>
                    <br></br>
                    <button onClick={() => setUnivAddModalOpen(true)}><IonIcon name="add" />&nbsp;대학 추가하기</button>
                </div>

                <BottomSheet open={univAddModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => [setUnivAddModalOpen(false),]}>
                    <div className="bottom-sheet">
                        <h3>대학 추가하기</h3>
                        <input placeholder="대학명을 입력하세요" value={univAddModalInput} onChange={(e) => setUnivAddModalInput(e.target.value)}></input>
                        <button onClick={() => addUnivToList()}>추가</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={addQuestionModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => [setAddQuestionModalOpen(false)]}>
                    <div className="bottom-sheet">
                        <h3>질문 추가하기</h3>
                        <input placeholder="질문을 입력하세요" value={modalContent} onChange={(e) => setModalContent(e.target.value)}></input>
                        <button onClick={() => addQuestion()}>추가</button>
                    </div>
                </BottomSheet>

            </main >
        </>
    )
}
