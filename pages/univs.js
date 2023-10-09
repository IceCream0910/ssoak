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
import { Sidebar } from "../components/sidebar";
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

    const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
    const [exampleLoading, setExampleLoading] = useState(false);
    const [exampleQuestionsData, setExampleQuestionsData] = useState(null);
    const [filteredQuestionsData, setFilteredQuestionsData] = useState(null);
    const [exampleSearchText, setExampleSearchText] = useState(null);
    const [selectedExamples, setSelectedExamples] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
    const [docsLoading, setDocsLoading] = useState(false);

    const [docsData, setDocsData] = useState(null);



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
                questions: []
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

    async function openExampleModal(query) {
        let convertedQuery = query.trim();
        setExampleLoading(true);
        setIsExampleModalOpen(true);
        if (!convertedQuery.includes('대학교') && convertedQuery.slice(-1) == '대') {
            convertedQuery += '학교'
        } else if (!convertedQuery.includes('대학교') && convertedQuery.slice(-1) != '대') {
            convertedQuery += '대학교'
        }
        const response = await fetch(`/api/univs/questions/${encodeURIComponent(convertedQuery)}`);
        const jsonData = await response.json();
        setExampleQuestionsData(jsonData);
        setExampleLoading(false);
    }

    async function openDocsModal(query) {
        let convertedQuery = query.trim();
        setDocsLoading(true);
        setIsDocsModalOpen(true);
        if (!convertedQuery.includes('대학교') && convertedQuery.slice(-1) == '대') {
            convertedQuery += '학교'
        } else if (!convertedQuery.includes('대학교') && convertedQuery.slice(-1) != '대') {
            convertedQuery += '대학교'
        }
        const response = await fetch(`/api/univs/documents/${encodeURIComponent(convertedQuery)}`);
        const jsonData = await response.json();
        setDocsData(jsonData);
        setDocsLoading(false);
    }

    useEffect(() => {
        if (exampleSearchText != '' && exampleSearchText) {
            setFilteredQuestionsData(
                exampleQuestionsData.filter((item) =>
                    item.모집단위.includes(exampleSearchText)
                )
            )
        }
    }, [exampleSearchText]);

    const handleExampleClick = (item) => {
        // 이미 선택된 항목인지 확인
        const isSelected = selectedExamples.includes(item);

        if (isSelected) {
            // 이미 선택된 항목인 경우, 선택 해제
            setSelectedExamples((prevSelected) =>
                prevSelected.filter((selected) => selected !== item)
            );
            setSelectedQuestions((prevQuestions) =>
                prevQuestions.filter((question) => question !== item.면접기출)
            );
        } else {
            // 선택되지 않은 항목인 경우, 선택 추가
            setSelectedExamples((prevSelected) => [...prevSelected, item]);
            setSelectedQuestions((prevQuestions) => [...prevQuestions, item.면접기출]);
        }
    }

    const addSelectedExamplesToMy = () => {
        // 이미 questions 리스트에 있는 질문은 추가하지 않음
        const newQuestions = selectedQuestions.filter(
            (question) => !questions.some((q) => q.question === question)
        );

        // 선택된 질문들을 questions 리스트에 추가
        setQuestions((prevQuestions) => [
            ...prevQuestions,
            ...newQuestions.map((question) => ({ question, answer: '' })),
        ]);

        // 선택한 항목들 초기화
        setSelectedExamples([]);
        setSelectedQuestions([]);
        setIsExampleModalOpen(false);
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

                <Sidebar />

                <br></br>
                <div className="outer-sidebar" id="univInfo">
                    <h2 id="only-mobile">대학별 정보</h2>
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


                    {(universities.length > 0) && <>
                        <button onClick={() => openDocsModal(universities[selectedItemIndex])}>{universities[selectedItemIndex]} 면접 참고 자료 찾아보기</button>
                        <br></br><br></br>
                        <div className="form-box">지원학과/학부
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
                                    <div key={index} className="analysis-left analysis-container" style={{ width: '100%', flexDirection: 'column' }}>
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

                        <br></br> <br></br>

                        <button onClick={() => openExampleModal(universities[selectedItemIndex])}>{universities[selectedItemIndex]} 면접 기출 확인하기</button>


                        <br></br> <br></br> <br></br>

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

                <BottomSheet open={isDocsModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => setIsDocsModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h3>{universities && universities[selectedItemIndex]} 면접 참고 자료
                            <span style={{ float: 'right', fontSize: '12px', opacity: 0.3, marginTop: '5px' }}>정보 출처 : <a href="https://dshs.site/" target="_blank" style={{ textDecoration: 'underline' }}>대학 수시면접 Archive</a></span>
                        </h3>

                        <div style={{ maxHeight: '60dvh', overflowY: 'scroll', paddingTop: '3px' }}>
                            {docsLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                <div className="loading-circle">
                                    <div className="spinner"></div>
                                </div>
                            </div>}
                            {docsData && docsData.length <= 0 && <p>자료를 찾지 못했어요</p>}
                            {docsData && docsData.map((item, index) => (
                                <div
                                    className={`example-question-card`}
                                    key={index}
                                    onClick={() => window.open(`https://dshs.site${item.filename.replace('.', '')}`, '_blank')}
                                >
                                    <h3>{item.displayname}</h3>
                                    <span>{item.recunit} - {item.type} | {item.source}</span>
                                </div>
                            )
                            )}
                        </div>

                        <button
                            onClick={() => setIsDocsModalOpen(false)}
                        >닫기</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={isExampleModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => [setExampleSearchText(''), setFilteredQuestionsData([]), setExampleQuestionsData([]), setIsExampleModalOpen(false)]}>
                    <div className="bottom-sheet">
                        <h3>{universities && universities[selectedItemIndex]} 면접 기출
                            <span style={{ float: 'right', fontSize: '12px', opacity: 0.3, marginTop: '5px' }}>정보 출처 : <a href="https://dshs.site/" target="_blank" style={{ textDecoration: 'underline' }}>대학 수시면접 Archive</a>, 정발고등학교</span>
                        </h3>
                        <input placeholder="모집단위(학과나 학부) 검색" value={exampleSearchText}
                            onChange={(e) => setExampleSearchText(e.target.value)}></input>
                        <div style={{ maxHeight: '60dvh', overflowY: 'scroll', paddingTop: '3px' }}>
                            {exampleLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                <div className="loading-circle">
                                    <div className="spinner"></div>
                                </div>
                            </div>}
                            {exampleQuestionsData && exampleQuestionsData.length <= 0 && <p>면접 기출을 찾지 못했어요</p>}
                            {exampleQuestionsData &&
                                ((exampleSearchText && filteredQuestionsData)
                                    ? filteredQuestionsData.map((item, index) => (
                                        <div
                                            className={`example-question-card ${selectedExamples.includes(item) ? 'active' : ''
                                                }`}
                                            key={index}
                                            onClick={() => handleExampleClick(item)}
                                        >
                                            <h3>{item.면접기출}</h3>
                                            <span>{item.모집단위} | {item.전형명}</span>
                                        </div>
                                    ))
                                    : exampleQuestionsData.map((item, index) => (
                                        <div
                                            className={`example-question-card ${selectedExamples.includes(item) ? 'active' : ''
                                                }`}
                                            key={index}
                                            onClick={() => handleExampleClick(item)}
                                        >
                                            <h3>{item.면접기출}</h3>
                                            <span>{item.모집단위} | {item.전형명}</span>
                                        </div>
                                    ))
                                )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: '50px', boxSizing: 'border-box', gap: '15px' }}>
                            <button
                                style={{ width: '50%', height: '50px' }}
                                onClick={() => addSelectedExamplesToMy()}
                            >선택한 질문 추가</button>

                            <button className="border"
                                style={{ width: '50%', height: '50px' }}
                                onClick={() => [setExampleSearchText(''), setFilteredQuestionsData([]), setExampleQuestionsData([]), setIsExampleModalOpen(false)]}
                            >닫기</button>

                        </div>
                    </div>
                </BottomSheet>

            </main >
        </>
    )
}
