import Head from "next/head";
import styles from '@/styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { convert } from 'html-to-text';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';
import IonIcon from '@reacticons/ionicons'
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'


export default function Upload() {
    const { data: session } = useSession();
    const router = useRouter();
    const [name, setName] = useState('');
    const [자동진JSON, set자동진JSON] = useState('');
    const [과세특JSON, set과세특JSON] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [itemCount, setItemCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [stopAnalysis, setStopAnalysis] = useState(false);
    const [hasQuestions, setHasQuestions] = useState(false);
    const [questions, setQuestions] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [isReseting, setIsReseting] = useState(false);

    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    setName(doc.data().sanggibu_name);
                    if (!doc.data().hasQuestions) {
                        alert('예상 질문을 먼저 생성해주세요.');
                        router.replace('/generate');
                    }
                    const 자동진 = (doc.data().sanggibu_자동진);
                    const 과세특 = (doc.data().sanggibu_과세특);
                    set자동진JSON(자동진);
                    set과세특JSON(과세특);
                    if (doc.data().questionsArr) {
                        setQuestions(doc.data().questionsArr);
                    } else {
                        setQuestions([])
                        convertToQuestions(자동진, 과세특);
                    }
                }
            }).catch((error) => {
                console.error(error)
            });
        } else {
            router.replace('/');
        }
    }, [session]);

    useEffect(() => {
        //console.log("자동진JSON", 자동진JSON)
        //console.log("과세특JSON", 과세특JSON)
    }, [자동진JSON, 과세특JSON]);

    useEffect(() => {
        console.log("questions", questions)
        if (isReseting) {
            save();
            setIsReseting(false);
        }
    }, [questions]);

    function convertToQuestions(자동진, 과세특) {
        자동진.map((item, index) => {
            if (!item.question) return;
            item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').split('[end]').map((question, index2) => {
                if (index2 >= 3) return null;
                setQuestions(questions => [...questions, { question: question, answer: '', type: '자동진', index: index, memo: '' }]);
            })
        });

        Object.keys(과세특).map((grade) => {
            Object.keys(과세특[grade]).map((category) => {
                {
                    과세특[grade][category].map((item, index) => {
                        if (index === 과세특[grade][category].length - 1 || item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.')) {
                            return;
                        }
                        item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').split('[end]').map((question, index2) => {
                            if (index2 >= 3) return null;
                            setQuestions(questions => [...questions, { question: question, answer: '', type: '과세특', grade: grade, category: category, index: index, memo: '' }]);
                        })
                    })
                }
            })
        })
    }


    function chatGPT() {
        fetch("https://free.churchless.tech/v1/chat/completions", {
            //GPT3.5
            method: "POST",
            headers: {
                Authorization: "Bearer BetterChatGPT",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: `` }],
                model: "gpt-3.5-turbo",
                max_tokens: 4096,
                temperature: 0.3,
                presence_penalty: 2,
                top_p: 1,
                frequency_penalty: 1,
                stream: true,
            }),
        })
            .then((response) => {
                if (!response.body) {
                    throw new Error("Response body is null");
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                async function readChunks() {
                    let result = await reader.read();
                    var resultMsg = "";
                    while (!result.done) {
                        const data = decoder.decode(result.value, {
                            stream: true,
                        });
                        const parsedData = data
                            .replaceAll("data: ", "")
                            .trim()
                            .split("\n");
                        parsedData.forEach((item) => {
                            if (data && isJson(item)) {
                                if (
                                    JSON.parse(item).choices &&
                                    JSON.parse(item).choices[0].delta &&
                                    JSON.parse(item).choices[0].delta.content
                                ) {
                                    resultMsg +=
                                        JSON.parse(item).choices[0].delta.content;
                                }
                            }
                        });
                        result = await reader.read();
                    }
                    console.log(index, "done", resultMsg);
                }
                readChunks();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    const handleAnswerEdit = (index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;

        let newQuestions = [...questions];
        newQuestions[index].answer = e.value;
        setQuestions(newQuestions);
    }

    const handleMemoEdit = (index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;

        let newQuestions = [...questions];
        newQuestions[index].memo = e.value;
        setQuestions(newQuestions);
    }


    function save() {
        if (questions && session.user?.id) {
            updateDoc(doc(db, "users", session.user?.id), {
                questionsArr: questions,
            }).then(() => {
                console.log("Document written with ID: ", session.user?.id);
                toast.success("저장했어요")
            }).catch((error) => {
                console.error("Error adding document: ", error);
            });
        }
    }

    function openDetailModal(index) {
        setModalOpen(true);
        if (questions[index].type === '자동진') {
            const indexOf자동진 = questions[index].index;
            setModalContent(자동진JSON[indexOf자동진].title + ": " + 자동진JSON[indexOf자동진].content);
        } else if (questions[index].type === '과세특') {
            const gradeOf과세특 = questions[index].grade;
            const categoryOf과세특 = questions[index].category;
            const indexOf과세특 = questions[index].index;
            setModalContent(과세특JSON[gradeOf과세특][categoryOf과세특][indexOf과세특].content);
        }
    }

    function reset() {
        if (confirm("정말로 초기화할까요? 모든 답변과 메모가 삭제되고, 현재 질문 생성 페이지의 모든 질문을 다시 불러옵니다.")) {
            setIsReseting(true);
            setQuestions([])
            convertToQuestions(자동진JSON, 과세특JSON);
            toast('질문을 다시 불러왔어요')
        }
    }

    return (
        <>
            <Toaster />
            <Head>
                <title>유니터뷰 - 면접 대비</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main}`}>

                <header>
                    <div className="header-left">
                        <IonIcon name='chevron-back-outline' onClick={() => router.back()} /><h3 className="header-title">면접 대비</h3>
                    </div>
                    <div className="header-right">
                        <button onClick={() => reset()}>초기화</button>
                        <button onClick={() => toast('아직 준비중인 기능이에요')}>PDF로 저장</button>
                    </div>
                </header>


                <br></br><br></br>

                {(name && questions) ? <>
                    <h2 style={{ marginLeft: '10px' }}>{questions.length}개의 질문이 있어요.</h2>
                    <p style={{ marginLeft: '10px' }}>
                        생성된 질문에 답변을 생각해 작성해보세요.<br></br>
                        전공과 무관하거나 불필요하다고 생각하는 질문은 답변을 입력하지 않아도 좋아요.<br></br>
                        답변이 바로 생각나지 않았거나 기억해야 할 내용이 있다면 메모를 추가해보세요.
                    </p>

                    {questions.map((item, index) => {
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
                                                className="answer-textarea"
                                                value={item.answer}
                                                onChange={(e) => handleAnswerEdit(index, e.target)}
                                                spellCheck="false"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="analysis-right">
                                        <button className="transparent"
                                            onClick={() => openDetailModal(index)}
                                        >생기부 기재 내용 확인하기&nbsp;<IonIcon name="chevron-up-circle-outline" /></button>
                                        <br></br><span style={{ marginLeft: '10px' }}>메모</span>
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
                                    <button className="transparent" style={{ float: 'right' }} onClick={() => save()}>저장&nbsp;&nbsp;<IonIcon name="checkmark-done-outline" /></button>
                                </div>
                            </div>
                        )
                    })
                    }
                </> : <></>}

                <BottomSheet open={modalOpen} expandOnContentDrag={true} onDismiss={() => setModalOpen(false)}>
                    <div className="bottom-sheet">
                        <div>
                            <h3>관련 생기부 기재 내용</h3>
                            <span>{modalContent}</span>
                        </div>
                        <br></br>
                        <button onClick={() => setModalOpen(false)}>닫기</button>
                    </div>
                </BottomSheet>
            </main >
        </>
    )
}
