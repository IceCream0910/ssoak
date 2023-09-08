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
    const [addQuestioMmodalOpen, setAddQuestionModalOpen] = useState(false);
    const [addQuestionText, setAddQuestionText] = useState('');
    const [modalGrade, setModalGrade] = useState(null);
    const [modalCategory, setModalCategory] = useState(null);
    const [modalIndex, setModalIndex] = useState(null);
    const [isProcessingSpecific, setIsProsessingSpecific] = useState(false);

    const [indexModalOpen, setIndexModalOpen] = useState(false);
    const [indexArr, setIndexArr] = useState(null)

    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    if (!doc.data().sanggibu_과세특) {
                        alert('생기부를 먼저 업로드해주세요.');
                        router.replace('/my');
                    }
                    setName(doc.data().sanggibu_name);
                    set자동진JSON(doc.data().sanggibu_자동진);
                    set과세특JSON(doc.data().sanggibu_과세특);
                    setHasQuestions(doc.data().hasQuestions || false);
                }
            }).catch((error) => {
                console.error(error)
            });
        } else {
            router.replace('/');
        }
    }, [session]);

    useEffect(() => {
        console.log("자동진JSON", 자동진JSON)
        console.log("과세특JSON", 과세특JSON)
        save();
    }, [자동진JSON, 과세특JSON]);

    async function startAnalysis() {
        setModalOpen(true);
        setItemCount(0);
        setCompletedCount(0);

        if (hasQuestions) {
            if (confirm('이미 생성된 질문이 있습니다. 비어있는 항목의 질문만 생성할까요? 취소를 누르면 처음부터 생성을 시작합니다.')) {
                await startAnalysis자동진OnlyEmpty();

                await new Promise(resolve => setTimeout(resolve, 3500));

                await startAnalysis과세특OnlyEmpty();
                toast.success('질문을 모두 생성했어요');
                setModalOpen(false);
                return;
            }
        }

        let 자동진Count = 0;
        for (let index = 0; index < 자동진JSON.length; index++) {
            if (!자동진JSON[index].content.includes('당해학년도 학교생활기록은 제공하지 않습니다')) {
                자동진Count++;
            }
        }

        let 과세특Count = 0;
        for (const grade in 과세특JSON) {
            for (const category in 과세특JSON[grade]) {
                for (let index = 0; index < 과세특JSON[grade][category].length - 1; index++) {
                    const item = 과세특JSON[grade][category][index];
                    if (!item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.')) {
                        과세특Count++;
                    }
                }
            }
        }

        setStopAnalysis(false);

        const totalCount = 자동진Count + 과세특Count;
        setItemCount(totalCount);
        await startAnalysis자동진();
        if (session) {
            updateDoc(doc(db, "users", session.user?.id), {
                hasQuestions: true,
            }).then(() => {
                console.log("Document written with ID: ", session.user?.id);
            }).catch((error) => {
                console.error("Error adding document: ", error);
            });
        }

        // Wait for 10 seconds before starting the next phase
        await new Promise(resolve => setTimeout(resolve, 10500));

        await startAnalysis과세특();
        toast.success('분석이 완료되었습니다.');
        setModalOpen(false);
    }

    async function startAnalysis자동진OnlyEmpty() {
        for (let index = 0; index < 자동진JSON.length; index++) {
            if (stopAnalysis) break;
            if (자동진JSON[index].content.includes('당해학년도 학교생활기록은 제공하지 않습니다')) continue;
            if (자동진JSON[index].question == '' || !자동진JSON[index].question) {
                await analysisByIndex(index);
                await new Promise(resolve => setTimeout(resolve, 11000));
            }
        }
    }

    async function startAnalysis자동진() {
        for (let index = 0; index < 자동진JSON.length; index++) {
            if (stopAnalysis) break;
            if (자동진JSON[index].content.includes('당해학년도 학교생활기록은 제공하지 않습니다')) continue;

            await analysisByIndex(index);

            // Wait for 10 seconds before processing the next item
            await new Promise(resolve => setTimeout(resolve, 11000));
        }
    }


    async function startAnalysis과세특OnlyEmpty() {
        for (const grade in 과세특JSON) {
            for (const category in 과세특JSON[grade]) {
                for (let index = 0; index < 과세특JSON[grade][category].length - 1; index++) {
                    if (stopAnalysis) break;
                    const item = 과세특JSON[grade][category][index];
                    if (item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.')) continue;
                    if (item.question == '' || !item.question) {
                        await analysisByArr(grade, category, index);
                        await new Promise(resolve => setTimeout(resolve, 10000));
                        save();
                    }
                }
            }
        }
    }

    async function startAnalysis과세특() {
        for (const grade in 과세특JSON) {
            for (const category in 과세특JSON[grade]) {
                for (let index = 0; index < 과세특JSON[grade][category].length - 1; index++) {
                    if (stopAnalysis) break;
                    const item = 과세특JSON[grade][category][index];
                    if (item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.')) continue;

                    await analysisByArr(grade, category, index);

                    // Wait for 10 seconds before processing the next item
                    await new Promise(resolve => setTimeout(resolve, 10500));
                    save();
                }
            }
        }
    }

    function analysisByIndex(index) {
        console.log(index, 'start');
        fetch("https://ai.fakeopen.com/v1/chat/completions", {
            //GPT3.5
            method: "POST",
            headers: {
                Authorization: "Bearer pk-this-is-a-real-free-pool-token-for-everyone",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [{
                    role: "system", content: `
                You're an interview question generater system three interview questions in korean based on the content of a given '세부능력 및 특기사항'. You need to gauge the student's effort, growth, and actual performance based on the given content. And you're not chatbot but system that should answer only in defined format. Don't answer like 'Sure, here are the three interview questions based on the given' at first.
                \`\`\`Here are the examples of interview question:
                - 국어 교과의 생각 키우기 활동에서 다문화 학생에 대한 역차별
                정책에 대한 글을 썼다고 합니다. 이 활동에서 주장한 본인의 의견을 간략하게 말씀해
                주세요.
                - 동아리 활동을 하면서 여러 나라의 문화와 언어를 배웠는데, 본인에게 가장 영향을 주었거나 인상 깊었던 나라는 어디였고, 어떤 영향을 받았는지 말씀해 주세요. 
                - 도시 환경을 개선하기 위해 환경 문제와 에너지 수급 문제는 매우 중요한 문제입니다. 교과 활동 중에 환경과 에너지 문제에 관심을 가지게 된 배경을 설명해 주세요.
                - 진로활동에서 3년 동안 꾸준히 프로그래머라는 직업에 관심을 보이며 관련된 활동을 했는데 실제로 작업한 프로그램이나 코딩작업은 무엇이었나요?
                - 수학 교과 시간에 미분을 이용하여 영화 CG그래픽을 보다 현실감 있게 만드는 방법에 대해 발표했는데 어떤 내용이었는지 구체적으로 얘기해 주세요.
                - 화성 가상 우주 기지 프로젝트 활동 중 식물 생육에 관해 조사했습니다. 이때 조사한 식물의 생육 방식에 대해 설명해 주고, 과학적인 근거도 같이 설명해 주세요.
                - 동아리 활동을 보니 파리대왕 토론 활동에서 형사미성년자의 나이를 하향해야 한다고 주장하였는데, 이 주장의 근거에 대하여 설명해 주세요.
                \`\`\`
                ` },
                {
                    role: "user", content: `
\`\`\`세부능력 및 특기사항(don't include in your answer):${자동진JSON[index].content}\`\`\`
Provide only 3 questions without prefixing your answer with your answer. Tell me the three interview questions. 각 질문 끝에는 [end]를 붙이고, 질문 앞에는 1. 2. 3.을 붙여주세요.
                    ` }],
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
                    자동진JSON[index].question += "[end]" + resultMsg;
                    자동진JSON[index].question = 자동진JSON[index].question.replaceAll('[end][end]', '[end]');
                    setCompletedCount((prev) => prev + 1);
                    setTimeout(() => {
                        set자동진JSON([...자동진JSON]);
                        setIsProsessingSpecific(false);
                    }, 1000);
                }

                readChunks();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function analysisByArr(grade, category, index) {
        console.log(grade, category, index, 'start');
        fetch("https://ai.fakeopen.com/v1/chat/completions", {
            //GPT3.5
            method: "POST",
            headers: {
                Authorization: "Bearer pk-this-is-a-real-free-pool-token-for-everyone",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [{
                    role: "system", content: `
                You're an interview question generater system three interview questions in korean based on the content of a given '세부능력 및 특기사항'. You need to gauge the student's effort, growth, and actual performance based on the given content. And you're not chatbot but system that should answer only in defined format. Don't answer like 'Sure, here are the three interview questions based on the given' at first.
                \`\`\`Here are the examples of interview question:
                - 국어 교과의 생각 키우기 활동에서 다문화 학생에 대한 역차별
                정책에 대한 글을 썼다고 합니다. 이 활동에서 주장한 본인의 의견을 간략하게 말씀해
                주세요.
                - 동아리 활동을 하면서 여러 나라의 문화와 언어를 배웠는데, 본인에게 가장 영향을 주었거나 인상 깊었던 나라는 어디였고, 어떤 영향을 받았는지 말씀해 주세요. 
                - 도시 환경을 개선하기 위해 환경 문제와 에너지 수급 문제는 매우 중요한 문제입니다. 교과 활동 중에 환경과 에너지 문제에 관심을 가지게 된 배경을 설명해 주세요.
                - 진로활동에서 3년 동안 꾸준히 프로그래머라는 직업에 관심을 보이며 관련된 활동을 했는데 실제로 작업한 프로그램이나 코딩작업은 무엇이었나요?
                - 수학 교과 시간에 미분을 이용하여 영화 CG그래픽을 보다 현실감 있게 만드는 방법에 대해 발표했는데 어떤 내용이었는지 구체적으로 얘기해 주세요.
                - 화성 가상 우주 기지 프로젝트 활동 중 식물 생육에 관해 조사했습니다. 이때 조사한 식물의 생육 방식에 대해 설명해 주고, 과학적인 근거도 같이 설명해 주세요.
                - 동아리 활동을 보니 파리대왕 토론 활동에서 형사미성년자의 나이를 하향해야 한다고 주장하였는데, 이 주장의 근거에 대하여 설명해 주세요.
                \`\`\`
                ` }, {
                    role: "user", content: `You're an interview question generater system three interview questions in korean based on the content of a given '세부능력 및 특기사항'. You need to gauge the student's effort, growth, and actual performance based on the given content. And you're not chatbot but system that should answer only in defined format. Don't answer like 'Sure, here are the three interview questions based on the given' at first.
\`\`\`세부능력 및 특기사항(don't include in your answer):${과세특JSON[grade][category][index].content}\`\`\`
Provide only 3 questions without prefixing your answer with your answer. Tell me the three interview questions. 각 질문 끝에는 [end]를 붙이고, 질문 앞에는 1. 2. 3.을 붙여주세요. 질문은 너무 길지 않게 한 문장으로만 해줘.
                    ` }],
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
                    과세특JSON[grade][category][index].question += "[end]" + resultMsg;
                    과세특JSON[grade][category][index].question = 과세특JSON[grade][category][index].question.replaceAll('[end][end]', '[end]');
                    setCompletedCount((prev) => prev + 1);
                    setIsProsessingSpecific(false);
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


    function save() {
        if (name && 자동진JSON && 과세특JSON && session.user?.id) {
            updateDoc(doc(db, "users", session.user?.id), {
                sanggibu_name: name,
                sanggibu_자동진: 자동진JSON,
                sanggibu_과세특: 과세특JSON
            }).then(() => {
                console.log("Document written with ID: ", session.user?.id);
            }).catch((error) => {
                console.error("Error adding document: ", error);
            });
        }
    }

    function stopAnalysisFunc() {
        updateDoc(doc(db, "users", session.user?.id), {
            sanggibu_name: name,
            sanggibu_자동진: 자동진JSON,
            sanggibu_과세특: 과세특JSON
        }).then(() => {
            console.log("Document written with ID: ", session.user?.id);
            location.reload();
        }).catch((error) => {
            console.error("Error adding document: ", error);
            alert('저장에 실패했습니다. 다시 시도해주세요.');
            location.reload();
        });
        setModalOpen(false);
    }

    function openAddQuestionModalByIndex(index) {
        setModalGrade(null);
        setModalCategory(null);
        setModalIndex(index);
        setAddQuestionText('');
        setAddQuestionModalOpen(true);
    }

    function openAddQuestionModalByMultiple(grade, category, index) {
        setModalGrade(grade);
        setModalCategory(category);
        setModalIndex(index);
        setAddQuestionModalOpen(true);
    }

    function addQuestion() {
        setAddQuestionModalOpen(false);
        if (addQuestionText && modalIndex != null) {
            if (modalGrade == null && modalCategory == null) {
                set자동진JSON((prev) => {
                    const updatedData = [...prev];
                    updatedData[modalIndex].question += addQuestionText + '[end]';
                    updatedData[modalIndex].question.replaceAll('[end][end]', '[end]');
                    return updatedData;
                });
            } else {
                set과세특JSON((prev) => {
                    const updatedData = { ...prev };
                    updatedData[modalGrade][modalCategory][modalIndex].question += addQuestionText + '[end]';
                    updatedData[modalGrade][modalCategory][modalIndex].question.replaceAll('[end][end]', '[end]');
                    return updatedData;
                });
            }
        } else {
            toast('질문을 입력해주세요.');
        }
    }

    function deleteQuestionByIndex(index, question) {
        question = question.trim();
        if (confirm('정말로 삭제하시겠습니까?')) {
            set자동진JSON((prev) => {
                const updatedData = [...prev];
                updatedData[index].question = updatedData[index].question.replace(question + '[end]', '').replace(question + ' [end]', '');
                console.log(updatedData[index].question)
                return updatedData;
            });
        }
    }

    function deleteQuestionByMultiple(grade, category, index, question) {
        question = question.trim();
        if (confirm('정말로 삭제하시겠습니까?')) {
            set과세특JSON((prev) => {
                const updatedData = { ...prev };
                updatedData[grade][category][index].question = updatedData[grade][category][index].question.replace(question + '[end]', '').replace(question + ' [end]', '');
                return updatedData;
            });
        }
    }

    const openIndexModal = () => {
        setIndexModalOpen(true);
        var newArr = ['1학년_자율활동', '1학년_동아리활동', '1학년_진로활동', '2학년_자율활동', '2학년_동아리활동', '2학년_진로활동', '3학년_자율활동', '3학년_동아리활동', '3학년_진로활동']
        if (!과세특JSON) return null;
        Object.keys(과세특JSON).map((grade) => {
            return (
                <div key={grade}>
                    <br></br>
                    <h3>{grade}학년&nbsp;&nbsp;&nbsp;&nbsp;<button onClick={() => openAddModal(grade)}>항목 추가</button></h3>

                    {Object.keys(과세특JSON[grade]).map((category) => {
                        return (
                            <div key={category}>
                                {과세특JSON[grade][category].map((item, index) => {
                                    if (!item.content) {
                                        return null;
                                    }
                                    if ((index === 과세특JSON[grade][category].length - 1 || item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.'))) {
                                        return null;
                                    }
                                    newArr.push(`${grade}학년_${item.content.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').split(': ')[0]}`)
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        })

        setIndexArr(newArr);
    }

    return (
        <>
            <Toaster />
            <Head>
                <title>유니터뷰 - 예상 질문 생성</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <button onClick={openIndexModal} className={`scroll-top-btn`} style={{ bottom: '75px' }}>
                <IonIcon name="list-outline" size="large" />
            </button>
            <main className={`${styles.main}`}>

                <header>
                    <div className="header-left">
                        <IonIcon name='chevron-back-outline' onClick={() => router.replace('/')} /><h3 className="header-title">예상 질문 생성</h3>
                    </div>
                    <div className="header-right">
                        <button onClick={() => startAnalysis()}>질문 일괄 생성</button>
                    </div>
                </header>


                <br></br><br></br><br></br>


                {(name && 자동진JSON && 과세특JSON) ? <>
                    <div className="analysis-container" style={{ marginBottom: '0', background: 'none', padding: '0' }}>
                        <h3 style={{ marginLeft: '10px' }}>자율/동아리/진로</h3>
                        <h3 className="header-title" style={{ width: '39%' }}>예상 질문</h3>
                    </div>
                    {자동진JSON &&
                        자동진JSON.map((item, index) => {
                            return (
                                <div key={index} className="analysis-container" id={`${item.grade}학년_${item.title}`}>
                                    <div className="analysis-left">
                                        <div className="analysis-card">
                                            <h4>{item.grade}학년 {item.title}</h4>
                                            {item.content}
                                        </div>

                                    </div>
                                    <div className="analysis-right">
                                        {item.question && item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').split('[end]').map((question, index2) => {
                                            if (index2 == item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').split('[end]').length - 1) return null;
                                            return (
                                                <div key={index2} className="question-card">
                                                    <h4>{question}</h4>
                                                    <button onClick={() => deleteQuestionByIndex(index, question)}><IonIcon name='close' /></button>
                                                </div>
                                            );
                                        })
                                        }
                                        <button className="transparent" onClick={() => openAddQuestionModalByIndex(index)}><IonIcon name="add-outline" />&nbsp;&nbsp;직접 질문 추가</button>
                                        <button className="transparent" onClick={() => [setIsProsessingSpecific(true), analysisByIndex(index)]}><IonIcon name="color-wand-outline" />&nbsp;&nbsp;AI 질문 생성</button>
                                    </div>

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
                                                    else if (item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.')) {
                                                        return (<></>
                                                        );
                                                    }
                                                    return (
                                                        <div key={index} className="analysis-container" id={item.content && `${grade}학년_${item.content.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').split(': ')[0]}`}>
                                                            <div className="analysis-left">
                                                                <div className="analysis-card">
                                                                    <h4></h4>
                                                                    {item.content}
                                                                </div>
                                                            </div>
                                                            <div className="analysis-right">
                                                                {item.question && item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').split('[end]').map((question, index2) => {
                                                                    if (index2 == item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').split('[end]').length - 1) return null;
                                                                    return (
                                                                        <div key={index2} className="question-card">
                                                                            <h4>{question}</h4>
                                                                            <button onClick={() => deleteQuestionByMultiple(grade, category, index, question)}><IonIcon name='close' /></button>
                                                                        </div>
                                                                    );
                                                                })
                                                                }
                                                                <button className="transparent" onClick={() => openAddQuestionModalByMultiple(grade, category, index)}><IonIcon name="add-outline" />&nbsp;&nbsp;직접 질문 추가</button>
                                                                <button className="transparent" onClick={() => [setIsProsessingSpecific(true), analysisByArr(grade, category, index)]}><IonIcon name="color-wand-outline" />&nbsp;&nbsp;AI 질문 생성</button>

                                                            </div>
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
                <BottomSheet open={modalOpen}>
                    <div className="bottom-sheet">
                        <div style={{ display: 'flex', alignItems: "center", gap: '20px' }}>
                            <div>
                                <div className="loading-circle">
                                    <div className="spinner"></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <h3>생기부를 분석하고 있어요.</h3>
                                <span>완료될 때까지 창을 닫지 말고 기다려주세요.</span>
                                <span>{itemCount != 0 ? itemCount + '개 중' : '비어있는 항목 중'} {completedCount}개 완료{(itemCount - completedCount) > 0 ? ' (약 ' + ((itemCount - completedCount) * 10) + '초 남음)' : ''}</span>
                            </div>
                        </div>
                        <br></br>
                        <button onClick={() => stopAnalysisFunc()}>중지하고 저장</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={addQuestioMmodalOpen} expandOnContentDrag={true} onDismiss={() => setAddQuestionModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h3>질문 추가</h3>
                        <input placeholder="질문을 입력하세요" value={addQuestionText} onChange={(e) => setAddQuestionText(e.target.value)}></input>
                        <button onClick={() => addQuestion()}>추가</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={isProcessingSpecific}>
                    <div className="bottom-sheet">
                        <div style={{ display: 'flex', alignItems: "center", gap: '20px' }}>
                            <div>
                                <div className="loading-circle">
                                    <div className="spinner"></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <h3>질문을 생성하고 있어요.</h3>
                                <span>완료될 때까지 창을 닫지 말고 기다려주세요.</span>
                            </div>
                        </div>
                        <br></br>
                        <button onClick={() => stopAnalysisFunc()}>중지</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={indexModalOpen} expandOnContentDrag={false} onDismiss={() => setIndexModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h2>빠른 탐색</h2>
                        <div style={{ height: '70dvh', overflowY: 'auto' }}>
                            {indexArr && indexArr.map((item, key) => {
                                return (<>
                                    <a key={key} href={`#${item}`} onClick={() => setIndexModalOpen(false)}>{item}<IonIcon name="chevron-forward-outline" /></a><br></br><br></br>
                                </>)
                            })}
                        </div>
                        <button onClick={() => setIndexModalOpen(false)}>닫기</button>
                    </div>
                </BottomSheet>
            </main >
        </>
    )
}