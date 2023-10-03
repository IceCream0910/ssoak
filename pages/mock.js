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
    const [isShowOnlyStar, setIsShowOnlyStar] = useState(true);

    const [isInit, setIsInit] = useState(true);

    const [prevValue, setPrevValue] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [recordVideoUri, setRecordVideoUri] = useState('');

    const [value, setValue] = useState('');

    const [isListening, setIsListening] = useState(true);
    const [tts, setTTS] = useState();

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
        getMediaPermission();

        setTTS(new Audio(
            `https://playentry.org/api/expansionBlock/tts/read.mp3?text=${encodeURIComponent(
                ''
            )}&speed=0&pitch=0&speaker=hana&volume=1`
        ));


        return () => {
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

    useEffect(() => {
        if (questions) {
            const isStarQuestions = questions.filter(question => question.isStar);
            if (isStarQuestions.length <= 0) {
                alert('스크랩한 질문이 최소 1개 이상 있어야 모의면접을 시작할 수 있어요.')
                router.replace('/');
            }
        }
    }, [questions]);

    function playTTS(text) {
        tts.pause();
        setTTS(new Audio(
            `https://playentry.org/api/expansionBlock/tts/read.mp3?text=${encodeURIComponent(
                text || '오류가 발생했어요'
            )}&speed=0&pitch=0&speaker=hana&volume=1`
        ));
    }

    useEffect(() => {
        tts && tts.play();
    }, [tts]);


    const handleTextareaChange = (event) => {
        const answer = event.target.value;
        setSelectedQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[currentQuestionIndex].answer = answer;
            return updatedQuestions;
        });
        setValue(answer);
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
        setIsInit(true);
        if (!questions) { alert('생성된 질문이 없어요. 먼저 예상 질문을 생성해주세요.'); return; }
        const excludedKeywords = ['지원한 동기', '지원동기', '지원 동기', '자기소개', '자기 소개']; //제외 키워드
        var isStarQuestions;
        if (isShowOnlyStar) {
            isStarQuestions = questions.filter(question => {
                const hasExcludedKeyword = excludedKeywords.some(keyword =>
                    question.question.includes(keyword)
                );
                return !hasExcludedKeyword;
            }).filter(question => question.isStar);
        } else {
            isStarQuestions = questions.filter(question => {
                const hasExcludedKeyword = excludedKeywords.some(keyword =>
                    question.question.includes(keyword)
                );
                return !hasExcludedKeyword;
            });
        }

        playTTS('자기소개와 지원동기를 말해주세요.');

        const uniqueIsStarQuestions = new Set();

        uniqueIsStarQuestions.add({ question: '간단한 자기소개와 지원동기를 말해주세요.', answer: '', type: '공통', index: 0, memo: '', isStar: true });


        while (uniqueIsStarQuestions.size < Math.min(6, isStarQuestions.length)) {
            const randomIndex = Math.floor(Math.random() * isStarQuestions.length);
            uniqueIsStarQuestions.add(isStarQuestions[randomIndex]);
        }

        const result = Array.from(uniqueIsStarQuestions);
        console.log(result);
        setSelectedQuestions(result);

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
                if (selectedQuestions[currentQuestionIndex]) {
                    setValue(resultTxt.replace(prevValue, '').replace(selectedQuestions[currentQuestionIndex].question.replace('?', ''), ''));
                } else {
                    setValue(resultTxt.replace(prevValue, ''));
                }

            };

            recognition.onend = () => {
                console.log("Speech recognition ended.");
            };

            recognition.onerror = (event) => {
                console.error("Error occurred in speech recognition:", event.error);
            };
            recognition.start();
        };

        startSpeechRecognition();
    }, [prevValue]);


    function nextQuestion() {
        setPrevValue(value);
        console.log(selectedQuestions[currentQuestionIndex + 1].question);
        playTTS(selectedQuestions[currentQuestionIndex + 1].question)
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
        link.download = `모의면접_${moment().format('YYMMDD_HHmmss')}.webm`;
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
        playTTS('수고하셨습니다. 모의면접이 종료되었습니다.');
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

            <header style={{ background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))', color: 'black' }}>
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
                    <button className="red" onClick={() => {
                        toast('다음에 또 만나요')
                        router.replace('/');
                        setTimeout(() => {
                            location.reload()
                        }, 500)
                    }}>나가기</button>
                </div>
            </header>

            {step != 2 && <video className="webcam" ref={videoRef} autoPlay />}

            {step === 0 && <div>
                <div className="mock-content-container">
                    <div style={{ float: 'right' }}>
                        <input type="checkbox" id="onlyShowStar" name="onlyShowStar" checked={isShowOnlyStar} onChange={(e) => setIsShowOnlyStar(e.target.checked)} />
                        <label for="onlyShowStar"> 스크랩된 질문에서만 질문</label></div>
                    <br></br>

                    <button onClick={() => [mediaRecorder.current?.start(), start()]}>
                        시작하기
                    </button>
                    <p style={{ opacity: 0.5, fontSize: 13 }}>* 질문이 음성으로 제시되니 볼륨을 알맞게 조절해주세요.
                        <br></br>* 브라우저에 따라 정상동작하지 않을 수 있습니다. Chrome 브라우저에 최적화되어 있습니다.</p>
                </div>
            </div>}

            {step === 1 && <div style={{ width: '50%' }}>
                {selectedQuestions &&
                    <div className="mock-content-container">
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
                    </div>
                }
            </div>}

            {step === 2 && <div style={{ padding: '20px' }}>
                <br></br><br></br><br></br>
                <h3>모의면접이 끝났어요!</h3>

                {recordVideoUri && (
                    <video className="record-video" controls>
                        <source src={recordVideoUri} type="video/webm" />
                        Your browser does not support the video tag.
                    </video>
                )}
                <br></br>
                <button onClick={() => downloadVideo()}>녹화한 영상 저장</button>
                <br></br><br></br>
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

                <br></br><br></br><br></br><br></br><br></br>
            </div>
            }
            <style jsx>
                {`
                    html {
                        overflow:hidden !important;
                    }
                `}
            </style>
        </>
    )
}
