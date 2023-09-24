import Head from "next/head";
import styles from '../styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import IonIcon from '@reacticons/ionicons'
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import moment from 'moment';


export default function Mock() {
    const { data: session } = useSession();
    const router = useRouter();

    const [univsNames, setUnivsNames] = useState(null);
    const [univs, setUnivs] = useState(null);
    const [questions, setQuestions] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState('');

    const [prevValue, setPrevValue] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [recordVideoUri, setRecordVideoUri] = useState('');

    const [value, setValue] = useState('');

    const videoRef = useRef(null);
    const mediaRecorder = useRef(null);
    const videoChunks = useRef([]);

    const [step, setStep] = useState(0);

    const db = firestore;
    let recognition;

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

        const screenWidth = window.innerWidth;

        if (screenWidth <= 768) {
            alert('PC에서만 지원되는 기능입니다.');
            router.replace('/')
        }
        getMediaPermission();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mediaRecorder.current) {
                mediaRecorder.current.stop();
                const videoTracks = videoRef.current?.srcObject?.getVideoTracks();
                const audioTracks = videoRef.current?.srcObject?.getAudioTracks();

                if (videoTracks) {
                    videoTracks.forEach((track) => track.stop());
                }

                if (audioTracks) {
                    audioTracks.forEach((track) => track.stop());
                }
            }
        };
    }, []);


    const handleTextareaChange = (event) => {
        const answer = event.target.value;
        // Update the selectedQuestions[currentQuestionIndex].answer
        // whenever the textarea value changes
        setSelectedQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[currentQuestionIndex].answer = answer;
            return updatedQuestions;
        });
    };

    const handleResize = () => {
        const screenWidth = window.innerWidth;

        if (screenWidth <= 768) {
            alert('PC에서만 지원되는 기능입니다.');
            router.replace('/')
        }
    };

    const getMediaPermission = useCallback(async () => {
        try {
            const audioConstraints = { audio: true };
            const videoConstraints = {
                audio: false,
                video: true,
            };

            const audioStream = await navigator.mediaDevices.getUserMedia(
                audioConstraints
            );
            const videoStream = await navigator.mediaDevices.getUserMedia(
                videoConstraints
            );

            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
            }

            // MediaRecorder 추가
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioStream.getAudioTracks(),
            ]);

            const recorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm',
            });

            recorder.ondataavailable = (e) => {
                if (typeof e.data === 'undefined') return;
                if (e.data.size === 0) return;
                videoChunks.current.push(e.data);
            };

            mediaRecorder.current = recorder;
        } catch (err) {
            console.log(err);
        }
    }, []);

    function start() {
        if (!questions) { alert('생성된 질문이 없어요. 먼저 예상 질문을 생성해주세요.'); return; }
        const isStarQuestions = questions.filter(question => question.isStar);
        const randomIsStarQuestions = [];

        for (let i = 0; i < Math.min(6, isStarQuestions.length); i++) {
            const randomIndex = Math.floor(Math.random() * isStarQuestions.length);
            randomIsStarQuestions.push(isStarQuestions[randomIndex]);
        }
        setSelectedQuestions(randomIsStarQuestions);

        setStep(1);
    }

    useEffect(() => {
        const startSpeechRecognition = () => {
            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = "ko-KR";
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            let resultTxt = "";

            recognition.onresult = (event) => {
                const speechResult =
                    event.results[event.results.length - 1][0].transcript;
                resultTxt += speechResult;
                console.log("result: ", resultTxt, "prev: ", prevValue);
                setValue(resultTxt.replace(prevValue, ''));
            };

            recognition.onend = () => {
                console.log("Speech recognition ended.");
            };

            recognition.onerror = (event) => {
                console.error("Error occurred in speech recognition:", event.error);
            };
            recognition.start();
        };

        // startSpeechRecognition 함수가 prevValue를 의존하도록 useEffect를 사용
        startSpeechRecognition();
    }, [prevValue]);


    function nextQuestion() {
        setPrevValue(value);
        setSelectedQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[currentQuestionIndex].answer = value;
            return updatedQuestions;
        });
        setValue('');
    }

    const downloadVideo = () => {
        const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        const link = document.createElement('a');
        link.download = `${moment().format('YYMMDD_HHmmss')}.webm`;
        link.href = videoUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    function complete() {
        setSelectedQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[currentQuestionIndex].answer = value;
            return updatedQuestions;
        });
        setStep(2);
        mediaRecorder.current?.stop();

        const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' });
        setRecordVideoUri(URL.createObjectURL(videoBlob))
    }
    return (
        <>
            <Toaster />
            <Head>
                <title>유니터뷰 - AI 모의면접</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main}`}>

                <header>
                    <div className="header-left">
                        <IonIcon name='chevron-back-outline' onClick={() => {
                            toast('다음에 또 만나요')
                            router.replace('/');
                            setTimeout(() => {
                                location.reload()
                            }, 1000)
                        }} /> <h3 className="header-title">AI 모의면접 <span className="badge">beta</span> </h3>
                    </div>
                    <div className="header-right">
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'row', gap: '50px', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                    {step != 2 &&
                        <div className="camera-container" style={{ width: '400px' }}>
                            <video ref={videoRef} autoPlay />
                        </div>}

                    {step === 0 && <div className="camera-container" style={{ gap: '10px' }}>
                        <p>
                            - 생성한 예상 질문 중 '답변 작성' 페이지에서 스크랩한 질문 중 6개를 랜덤으로 질문합니다.<br></br>
                            - 질문이 화면에 표시된 후 답변을 말하면 자동으로 인식되어 입력됩니다.<br></br>
                            - 질문에 대한 답변이 끝나면 '다음 답변' 버튼을 눌러주세요.
                        </p>

                        <button onClick={() => [mediaRecorder.current?.start(), start()]}>
                            시작하기
                        </button>
                    </div>}

                    {step === 1 && <div style={{ width: '50%' }}>
                        {selectedQuestions &&
                            <>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                    <h1 style={{ marginTop: '5px', color: '#5272ff' }}>Q.</h1>
                                    <h4>{selectedQuestions[currentQuestionIndex].question}</h4>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px' }}>
                                    <h1 style={{ marginTop: '5px', color: '#5272ff' }}>A.</h1>
                                    <textarea
                                        className="answer-textarea"
                                        spellCheck="false"
                                        autoComplete="off"
                                        value={value} // Display recognized speech in textarea
                                        onChange={handleTextareaChange} // Update answer as user types
                                    />
                                </div>
                                <br></br>

                                {currentQuestionIndex === selectedQuestions.length - 1 ? <button onClick={() => complete()}>완료</button>
                                    : <button onClick={() => [setCurrentQuestionIndex(currentQuestionIndex + 1), nextQuestion()]}>다음 질문</button>}
                            </>
                        }
                    </div>}

                    {step === 2 && <div style={{ flexDirection: 'column' }}>
                        <h3>모의면접이 끝났어요!</h3>

                        {selectedQuestions && selectedQuestions.map((item, index) => {
                            if (item.question.length < 2 || !item.question || item.question == "undefined") return null;
                            return (
                                <div key={index} className="analysis-container" style={{ flexDirection: 'column' }}>
                                    <div id="practice-container" style={{ display: 'flex', gap: '50px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px', width: '100%' }}>
                                            <h1 style={{ marginTop: '5px', color: '#5272ff' }}>Q.</h1>
                                            <h4>{item.question}</h4>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', gap: '10px', width: '100%' }}>
                                            <h1 style={{ marginTop: '5px', color: '#5272ff' }}>A.</h1>
                                            <p>{item.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                        }

                        <button onClick={() => downloadVideo()}>녹화한 영상 저장</button>

                        <button onClick={() => {
                            toast('다음에 또 만나요')
                            router.replace('/');
                            setTimeout(() => {
                                location.reload()
                            }, 1000)
                        }}>나가기</button>
                    </div>
                    }

                </div>
            </main >
        </>
    )
}
