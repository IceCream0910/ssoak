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

export default function Chat() {
    const { data: session } = useSession();
    const router = useRouter();

    const [univsNames, setUnivsNames] = useState(null);
    const [univs, setUnivs] = useState(null);
    const [questions, setQuestions] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState('');
    const [isShowOnlyStar, setIsShowOnlyStar] = useState(false);

    const [isInit, setIsInit] = useState(true);

    const [prevValue, setPrevValue] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [value, setValue] = useState('');
    const [step, setStep] = useState(0);

    const [isDisabled, setIsDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isTailing, setIsTailing] = useState(false);
    const [chatData, setChatData] = useState([{ role: 'assistant', content: '안녕하세요! 만나서 반갑습니다. 지금까지 생성한 예상 질문을 기반으로 모의 면접을 진행해보겠습니다.' }, { role: 'assistant', content: '총 몇 개의 질문을 해드릴까요?' }]);
    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    setUnivsNames(doc.data().universitiesName);
                    setUnivs(doc.data().universities);
                    setQuestions(doc.data().questionsArr || null);
                }
            }).catch((error) => {
                console.error(error)
            });
        } else {
            router.replace('/');
        }
    }, []);

    const addMessage = (role, content) => {
        if (role === 'assistant') {
            setIsLoading(true);
            const delay = Math.floor(Math.random() * 2) + 0.5; // 1~3초 랜덤 시간 지연
            setTimeout(() => {
                setChatData(prevChatData => [
                    ...prevChatData,
                    { role, content }
                ]);
                setIsDisabled(false);
                setIsLoading(false);
            }, delay * 1000);
        } else {
            setChatData(prevChatData => [
                ...prevChatData,
                { role, content }
            ]);
        }
    };

    useEffect(() => {
        const input = document.querySelector('input');
        if (input)
            input.focus();
    }, [isDisabled]);

    useEffect(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer)
            chatContainer.scroll({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
    }, [chatData]);

    const handleTextareaChange = (event) => {
        const answer = event.target.value;
        setSelectedQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            if (isTailing) {
                updatedQuestions[currentQuestionIndex + 1].answer = answer;
            } else {
                updatedQuestions[currentQuestionIndex].answer = answer;
            }
            return updatedQuestions;
        });
        setValue(answer);
    };


    function start(num) {
        setIsInit(true);
        if (!questions) {
            alert("생성된 질문이 없어요. 먼저 예상 질문을 생성해주세요.");
            return;
        }
        const excludedKeywords = [
            "지원한 동기",
            "지원동기",
            "지원 동기",
            "자기소개",
            "자기 소개",
        ]; //제외 키워드
        var isStarQuestions;
        if (isShowOnlyStar) {
            isStarQuestions = questions
                .filter((question) => question.question != 'undefined' && question.isStar)
                .filter((question) => {
                    const hasExcludedKeyword = excludedKeywords.some((keyword) =>
                        question.question.includes(keyword)
                    );
                    return !hasExcludedKeyword;
                });
        } else {
            isStarQuestions = questions
                .filter((question) => question.question != 'undefined' && !question.isStar) // exclude questions with undefined question property
                .filter((question) => {
                    const hasExcludedKeyword = excludedKeywords.some((keyword) =>
                        question.question.includes(keyword)
                    );
                    return !hasExcludedKeyword;
                });
        }

        const uniqueIsStarQuestions = new Set();

        uniqueIsStarQuestions.add({
            question: "먼저 자기소개와 지원동기를 말해주세요.",
            answer: "",
            type: "공통",
            index: 0,
            memo: "",
            isStar: true,
        });

        while (
            uniqueIsStarQuestions.size < Math.min(num, isStarQuestions.length)
        ) {
            const randomIndex = Math.floor(Math.random() * isStarQuestions.length);
            uniqueIsStarQuestions.add(isStarQuestions[randomIndex]);
        }

        const result = Array.from(uniqueIsStarQuestions);
        console.log(result);
        setSelectedQuestions(result);
        addMessage('assistant', '네, 그럼 먼저 자기소개와 지원동기를 말해주세요.');
        setStep(1);
    }

    const generateTailQuestion = async () => {
        try {
            const response = await fetch("/api/openai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content:
                                "You're a college interviewer AI. Given the answer to the previous question, generate a follow-on question for it. Answer the question in Korean without any additional explanation.",
                        },
                        {
                            role: "user",
                            content: "Q:" + selectedQuestions[currentQuestionIndex].question + "\nA:" + selectedQuestions[currentQuestionIndex].answer,
                        },
                    ],
                    isJson: false,
                }),
            });

            if (!response.body) {
                throw new Error("Response body is null");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            async function readChunks() {
                let result = await reader.read();
                let resultMsg = '';
                while (!result.done) {
                    const data = decoder.decode(result.value, { stream: true });
                    resultMsg = JSON.parse(data).choices[0].message.content;
                    result = await reader.read();
                }
                console.log("done", resultMsg);
                return resultMsg;
            }

            return await readChunks();
        } catch (error) {
            console.error('Error in generateTailQuestion:', error);
            return null; // Return null or an appropriate default value in case of an error
        }
    };


    const send = () => {
        if (value) {
            addMessage('user', value);
            setValue('');
            setIsDisabled(true);

            if (isTailing) {
                setIsTailing(false);
                proceedToNextQuestion();
            } else {
                const shouldGenerateTail = Math.random() < 0.8 && currentQuestionIndex < selectedQuestions.length - 1;

                if (shouldGenerateTail) {
                    generateAndSetTailQuestion();
                    setIsTailing(true);
                } else {
                    setIsTailing(false);
                    proceedToNextQuestion();
                }
            }
        }
    };

    const generateAndSetTailQuestion = async () => {
        try {
            const tailQuestion = await generateTailQuestion(); // Generate the tail question
            console.log(tailQuestion)
            const parentQuestionIndex = currentQuestionIndex;

            const updatedQuestionsWithTail = [...selectedQuestions];
            updatedQuestionsWithTail.splice(parentQuestionIndex + 1, 0, {
                question: tailQuestion,
                answer: '', // New tail question's answer initialized as an empty string
                type: "tail",
                index: parentQuestionIndex + 1,
                memo: "",
                isStar: false,
            });

            setIsTailing(true);
            addMessage('assistant', tailQuestion);
            setSelectedQuestions(updatedQuestionsWithTail);
        } catch (error) {
            console.error('Error generating tail question:', error);
        }
    };


    // Function to proceed to the next question
    const proceedToNextQuestion = () => {
        if (currentQuestionIndex < selectedQuestions.length - 1) {
            if (isTailing) {
                setCurrentQuestionIndex(currentQuestionIndex + 2);
                const strings = ['네, 그렇군요.', '네, 잘 들었습니다.', '좋습니다.', '알겠습니다.', '네, 그럼 다음 질문 하겠습니다.', '그렇군요.', '그래요. 그럼', '좋아요.'];
                addMessage('assistant', strings[Math.floor(Math.random() * strings.length)] + ' ' + selectedQuestions[currentQuestionIndex + 2].question);
            } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                const strings = ['네, 그렇군요.', '네, 잘 들었습니다.', '좋습니다.', '알겠습니다.', '네, 그럼 다음 질문 하겠습니다.', '그렇군요.', '그래요. 그럼', '좋아요.'];
                addMessage('assistant', strings[Math.floor(Math.random() * strings.length)] + ' ' + selectedQuestions[currentQuestionIndex + 1].question);
            }

        } else {
            addMessage('assistant', '시간이 다 됐네요. 수고하셨습니다. 곧 챗터뷰 리포트를 보여드릴게요.');
            setTimeout(() => {
                setStep(2);
                console.log(selectedQuestions)
            }, 2000);
        }
    };


    return (
        <>
            <Toaster />
            <Head>
                <title>유니터뷰 - 대학별 예상 질문</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <style>{`
                html {
                    overflow: hidden;
                }
                `}
                </style>
            </Head>
            <main className={`${styles.main}`}>

                <Sidebar />

                <div className="outer-sidebar without-nav" id="chat">

                    {step != 2 && <>
                        <div className="chat-container">
                            {chatData.map((message, index) => (<>
                                <div
                                    key={index}
                                    className={`message ${message.role === 'assistant' ? 'assistant-message' : 'user-message'}`}
                                >
                                    {message.content}
                                </div><br></br><br></br></>
                            ))}

                            {isLoading && <div className='message assistant-message'>
                                <div>
                                    <div className="loading-circle" style={{ width: '20px', height: '20px', border: '2px solid #5272ff', borderTop: '2px solid #becfff' }}>
                                        <div className="spinner"></div>
                                    </div>
                                </div>
                            </div>}


                        </div>


                        <div className="input-container">
                            <input type="text" placeholder="메시지 입력"
                                value={value}
                                disabled={isDisabled}
                                onKeyUp={(e) => { e.key === 'Enter' && send() }}
                                onChange={(e) => handleTextareaChange(e)}></input>
                            <button onClick={() => send()}><IonIcon name="navigate" /></button>
                        </div>



                        {step === 0 && <div className="suggest-reply-container">
                            <button onClick={() => [addMessage('user', '최대 6개의 질문을 해주세요'), start(6)]}>
                                6개
                            </button>
                            <button onClick={() => [addMessage('user', '최대 8개의 질문을 해주세요'), start(8)]}>
                                8개
                            </button>
                            <button onClick={() => [addMessage('user', '최대 12개의 질문을 해주세요'), start(12)]}>
                                12개
                            </button>
                            <button onClick={() => [addMessage('user', '만들어놓은 모든 질문을 해주세요.'), start(500)]}>
                                무제한
                            </button>
                        </div>
                        }
                    </>}

                    {step === 2 && <div>
                        <h3>챗터뷰 리포트.</h3>
                        <div style={{ height: '85vh', overflowY: 'scroll' }}>
                            {selectedQuestions && selectedQuestions.map((item, index) => {
                                if (item.question.length < 2 || !item.question || item.question == "undefined") return null;
                                return (
                                    <div key={index} className="analysis-container" style={{ flexDirection: 'column' }}>
                                        <div id="practice-container" style={{ display: 'flex', gap: '50px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px', width: '100%' }}>
                                                <h1 style={{ marginTop: '5px', color: '#5272ff' }}>Q.</h1>
                                                <h4>{item.type == 'tail' && '[꼬리질문] '} {item.question}</h4>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px', width: '100%' }}>
                                                <h1 style={{ marginTop: '5px', color: '#5272ff' }}>A.</h1>
                                                <p style={{ width: '100%', wordBreak: 'break-all' }}>{item.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                            }<br></br><br></br><br></br><br></br><br></br>
                        </div>

                    </div>
                    }

                </div>
            </main >
        </>
    )
}