import Head from "next/head";
import styles from '../styles/Home.module.css'
import { useSession, signIn, signOut } from "next-auth/react";
import firestore from "../firebase/firebase"
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import { convert } from 'html-to-text';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';
import IonIcon from '@reacticons/ionicons'
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import Ocr from "../components/ocr";
import { Sidebar } from "../components/sidebar";
import { LoginBtn } from "../components/loginBtn";


export default function Upload() {
    const { data: session } = useSession();
    const router = useRouter();
    const [html, setHtml] = useState('');
    const [text, setText] = useState('');
    const [name, setName] = useState('');

    const [ocrModalOpen, setOCRModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const [commonQuestions, setCommonQuestions] = useState(['자기소개 해주세요.', '이 학과에 지원한 동기를 말씀해주세요.']);
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

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addmodalGrade, setAddModalGrade] = useState('');
    const [modalSubject, setModalSubject] = useState('');
    const [modalContent, setModalContent] = useState('');

    const [indexModalOpen, setIndexModalOpen] = useState(false);
    const [indexArr, setIndexArr] = useState(null);

    const [addCommonQuestionModalOpen, setAddCommonQuestionModalOpen] = useState(false);
    const [addCommonQuestionText, setAddCommonQuestionText] = useState('');
    const saveTimeoutRef = useRef(null);
    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    setName(doc.data().sanggibu_name);
                    if (doc.data().commonQuestions) setCommonQuestions(doc.data().commonQuestions);
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
        if (!과세특JSON) return;
        var newArr = ['공통질문', '1학년_자율활동', '1학년_동아리활동', '1학년_진로활동', '2학년_자율활동', '2학년_동아리활동', '2학년_진로활동', '3학년_자율활동', '3학년_동아리활동', '3학년_진로활동']
        Object.keys(과세특JSON).map((grade) => {
            {
                Object.keys(과세특JSON[grade]).map((category) => {
                    {
                        과세특JSON[grade][category].map((item, index) => {
                            if (item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.') || !item.content) {
                                return null;
                            }
                            newArr.push(`${grade}학년_${item.content.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').split(': ')[0]}`)
                        })
                    }
                })
            }
        })

        setIndexArr(newArr);
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            save();
        }, 700);
    }, [자동진JSON, 과세특JSON]);



    /* 생기부 업로드 로직 시작 */
    const handleUpload = async (event) => {
        setUploadModalOpen(false);
        const file = event.target.files[0];
        const fileName = event.target.value;
        console.log(file, fileName);
        if (file) {
            if (fileName.split('.').pop().toLowerCase() === 'pdf') {
                const pdfText = await convertPDFToText(file);

                //이름 추출
                const nameStartIndex = pdfText.indexOf('학생정보 성명 : ');
                const nameEndIndex = pdfText.indexOf('성별 :');
                let name = pdfText.substring(nameStartIndex, nameEndIndex).trim();
                setName(name.replace(/(\s*)/g, "").replace(/(\n*)/g, "").replace("학생정보성명:", "").replace("성별 :", "").replace("성별 :", ""));

                //자율/동아리/진로 추출
                const creativeStartIndex = pdfText.indexOf('5. 창의적 체험활동상황');
                const creativeEndIndex = pdfText.indexOf('학 년 봉 사 활 동 실 적');
                let creative = pdfText.substring(creativeStartIndex, creativeEndIndex).trim().replace("5. 창의적 체험활동상황", "");
                set자동진JSON(convert자동진TextToJSON(creative));

                //과세특 추출
                const tax1학년 = pdfText.split('6. 교과학습발달상황  [1학년]')[1];
                var startIndex = tax1학년.indexOf('세 부 능 력 및 특 기 사 항 ');
                var endIndex = tax1학년.indexOf('<진로 선택 과목> ');
                const 과세특1학년Raw = tax1학년.substring(startIndex, endIndex).trim().replace("세 부 능 력 및 특 기 사 항 ", "");
                const 과세특1학년 = combineArrayElements(splitArrayElements(과세특1학년Raw.split(': ')))

                const 과세특_1학년 = [];
                과세특1학년.forEach(item => {
                    과세특_1학년.push({ content: item });
                });

                const tax1학년진로 = tax1학년.split('<진로 선택 과목> ')[1];
                startIndex = tax1학년진로.indexOf('세 부 능 력 및 특 기 사 항 체육:');
                endIndex = tax1학년진로.indexOf('[2학년] ');
                const 과세특1학년진로Raw = tax1학년진로.substring(startIndex, endIndex).trim().replace("세 부 능 력 및 특 기 사 항 ", "");
                const 과세특1학년진로 = combineArrayElements(splitArrayElements(과세특1학년진로Raw.split(': ')))

                const 과세특_1학년_진로선택 = [];
                과세특1학년진로.forEach(item => {
                    과세특_1학년_진로선택.push({ content: item });
                });

                const tax2학년 = pdfText.split('[2학년] ')[1];
                var startIndex = tax2학년.indexOf('세 부 능 력 및 특 기 사 항 ');
                var endIndex = tax2학년.indexOf('<진로 선택 과목> ');
                const 과세특2학년Raw = tax2학년.substring(startIndex, endIndex).trim().replace("세 부 능 력 및 특 기 사 항 ", "");
                const 과세특2학년 = combineArrayElements(splitArrayElements(과세특2학년Raw.split(': ')))

                const 과세특_2학년 = [];
                과세특2학년.forEach(item => {
                    과세특_2학년.push({ content: item });
                });
                console.log(과세특_2학년);

                const tax2학년진로 = tax2학년.split('<진로 선택 과목> ')[1];
                startIndex = tax2학년진로.indexOf('세 부 능 력 및 특 기 사 항 ');
                endIndex = tax2학년진로.indexOf('[3학년] ');
                const 과세특2학년진로Raw = tax2학년진로.substring(startIndex, endIndex).trim().replace("세 부 능 력 및 특 기 사 항 ", "");
                const 과세특2학년진로 = combineArrayElements(splitArrayElements(과세특2학년진로Raw.split(': ')))

                const 과세특_2학년_진로선택 = [];
                과세특2학년진로.forEach(item => {
                    과세특_2학년_진로선택.push({ content: item });
                });

                set과세특JSON({
                    "1": {
                        "1": 과세특_1학년,
                        "2": 과세특_1학년_진로선택
                    },
                    "2": {
                        "1": 과세특_2학년,
                        "2": 과세특_2학년_진로선택
                    },
                    "3": {
                        "1": [
                            {
                                "content": "\n당해학년도 학교생활기록은 제공하지 않습니다."
                            },
                            {
                                "content": ""
                            }
                        ],
                        "2": [
                            {
                                "content": "\n당해학년도 학교생활기록은 제공하지 않습니다."
                            },
                            {
                                "content": ""
                            }
                        ],
                        "3": [
                            {
                                "content": "\n당해학년도 학교생활기록은 제공하지 않습니다."
                            },
                            {
                                "content": ""
                            }
                        ],
                    }
                });

                toast.success('생기부 업로드 성공! 저장 버튼을 꼭 눌러주세요');

            } else if (fileName.split('.').pop().toLowerCase() === 'htm' || fileName.split('.').pop().toLowerCase() === 'html') {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const html = event.target.result;
                    setHtml(html);
                    const options = {
                        wordwrap: 130,
                        preserveNewlines: true,
                    };
                    const text = convert(html, options);
                    setText(text);
                    //이름 추출
                    const nameStartIndex = text.indexOf('* 성명');
                    const nameEndIndex = text.indexOf('* 주민등록번호');
                    let name = text.substring(nameStartIndex, nameEndIndex).trim();
                    setName(name.replace(/(\s*)/g, "").replace(/(\n*)/g, "").replace("*성명", "").replace("성별남", "").replace("성별여", ""));

                    //자율/진로 추출 (5. 창의적 체험활동상황 < 창의적 체험활동상황 > ~ < 봉사활동실적 >)
                    const creativeStartIndex = html.indexOf('&lt; 창의적 체험활동상황 &gt;');
                    const creativeEndIndex = html.indexOf('&lt; 봉사활동실적 &gt;');
                    let creative = html.substring(creativeStartIndex, creativeEndIndex).trim().replace("&lt; 창의적 체험활동상황 &gt;", "");
                    set자동진JSON(JSON.parse(parseToJSON(creative)));

                    //과세특 추출 (6. 교과학습발달상황 ~ 7. 독서활동상황)
                    const taxStartIndex = html.indexOf('class="sub-tit-b">6. 교과학습발달상황</h2>');
                    const taxEndIndex = html.indexOf('7. 독서활동상황');
                    let tax = html.substring(taxStartIndex, taxEndIndex).trim().replace(`class="sub-tit-b">6. 교과학습발달상황</h2>`, "");

                    const 과세특Text = convert(tax, options);

                    const splited과세특Text = 과세특Text.split(`세부능력 및 특기사항`);

                    const 과세특_1학년 = [];
                    splited과세특Text[1].split('< 진로 선택 과목 >')[0].split('\n\n').forEach(item => {
                        과세특_1학년.push({ content: item });
                    });

                    const 과세특_1학년_진로선택 = [];
                    splited과세특Text[3].split('원점수/과목평균(표준편차)')[0].slice(0, -18).split('\n\n').forEach(item => {
                        과세특_1학년_진로선택.push({ content: item });
                    });

                    const 과세특_2학년 = [];
                    splited과세특Text[4].split('< 진로 선택 과목 >')[0].split('\n\n').forEach(item => {
                        과세특_2학년.push({ content: item });
                    });

                    const 과세특_2학년_진로선택1 = [];
                    splited과세특Text[5].split('< 체육 · 예술 >')[0].split('\n\n').forEach(item => {
                        과세특_2학년_진로선택1.push({ content: item });
                    });

                    const 과세특_2학년_진로선택2 = [];
                    splited과세특Text[6].split('원점수/과목평균(표준편차)')[0].slice(0, -18).split('\n\n').forEach(item => {
                        과세특_2학년_진로선택2.push({ content: item });
                    });

                    const 과세특_3학년 = [];
                    splited과세특Text[7].split('< 진로 선택 과목 >')[0].split('\n\n').forEach(item => {
                        과세특_3학년.push({ content: item });
                    });

                    const 과세특_3학년_진로선택1 = [];
                    splited과세특Text[8].split('< 체육 · 예술 >')[0].split('\n\n').forEach(item => {
                        과세특_3학년_진로선택1.push({ content: item });
                    });

                    const 과세특_3학년_진로선택2 = [];
                    splited과세특Text[9].split('원점수/과목평균(표준편차)')[0].split('\n\n').forEach(item => {
                        과세특_3학년_진로선택2.push({ content: item });
                    });

                    set과세특JSON({
                        "1": {
                            "1": 과세특_1학년,
                            "2": 과세특_1학년_진로선택
                        },
                        "2": {
                            "1": 과세특_2학년,
                            "2": 과세특_2학년_진로선택1,
                            "3": 과세특_2학년_진로선택2
                        },
                        "3": {
                            "1": 과세특_3학년,
                            "2": 과세특_3학년_진로선택1,
                            "3": 과세특_3학년_진로선택2
                        }
                    });
                    toast.success('생기부 업로드 성공! 저장 버튼을 꼭 눌러주세요');
                    console.log(과세특_3학년_진로선택1, 과세특_3학년_진로선택2)
                }
                reader.readAsText(file);
            } else {
                toast.error('올바른 확장자의 파일을 업로드해주세요')
            }
        }

    }

    const convertPDFToText = async (file) => {
        const pdfjsLib = window.pdfjsLib; // Access the library from the global scope

        if (!pdfjsLib) {
            console.error('pdfjsLib is not available. Make sure the script is loaded correctly.');
            return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.303/pdf.worker.min.js';

        const pdfData = new Uint8Array(await file.arrayBuffer());

        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageString = pageText.items.map((item) => item.str).join(' ');
            text += pageString + ' ';
        }

        return text;
    };

    function convert자동진TextToJSON(text) {
        //자율
        var startIndex = text.indexOf('1 자율활동');
        var endIndex = text.indexOf('동아리활동   ');
        const 자율1학년 = text.substring(startIndex, endIndex).trim().replace('1 자율활동   60 ', '').replace('1 자율활동   ', '');

        startIndex = text.indexOf('동아리활동   ');
        endIndex = text.indexOf('진로활동   ');
        const 동아리1학년 = text.substring(startIndex, endIndex).trim().replace('동아리활동   34 ', '').replace('1 자율활동   ', '').replace('학년 창 의 적 체 험 활 동 상 황 영역   시간   특기사항 1', '');

        startIndex = text.indexOf('진로활동   ');
        endIndex = text.indexOf('2   자율활동   ');
        const 진로1학년 = text.substring(startIndex, endIndex).trim().replace('진로활동   34 ', '').replace('진로활동   ', '').replace('학년 창 의 적 체 험 활 동 상 황 영역   시간   특기사항 1', '');

        const text2 = text.split('2   자율활동   ')[1];
        startIndex = text2.indexOf('2   자율활동   ');
        endIndex = text2.indexOf('2 동아리활동   ');
        const 자율2학년 = text2.substring(startIndex, endIndex).trim().replace('58 ', '').replace('2   자율활동   ', '').replace('학년 창 의 적 체 험 활 동 상 황 영역   시간   특기사항', '');

        startIndex = text2.indexOf('2 동아리활동   ');
        endIndex = text2.indexOf('진로활동   ');
        const 동아리2학년 = text2.substring(startIndex, endIndex).trim().replace('34 ', '').replace('2 동아리활동   ', '').replace('학년 창 의 적 체 험 활 동 상 황 영역   시간   특기사항', '');

        startIndex = text2.indexOf('진로활동   ');
        endIndex = text2.indexOf('3 자율활동');
        const 진로2학년 = text2.substring(startIndex, endIndex).trim().replace('33 ', '').replace('진로활동   ', '').replace('학년 창 의 적 체 험 활 동 상 황 영역   시간   특기사항', '');

        return [
            {
                grade: 1,
                content: 자율1학년,
                question: '',
                title: "자율활동"
            },
            {
                grade: 1,
                content: 동아리1학년,
                question: '',
                title: "동아리활동"
            },
            {
                grade: 1,
                content: 진로1학년,
                question: '',
                title: "진로활동"
            },
            {
                grade: 2,
                content: 자율2학년,
                question: '',
                title: "자율활동"
            },
            {
                grade: 2,
                content: 동아리2학년,
                question: '',
                title: "동아리활동"
            },
            {
                grade: 2,
                content: 진로2학년,
                question: '',
                title: "진로활동"
            },
            {
                grade: 3,
                content: '당해학년도 학교생활기록은 제공하지 않습니다.',
                question: '',
                title: "자율활동"
            },
            {
                grade: 3,
                content: '당해학년도 학교생활기록은 제공하지 않습니다.',
                question: '',
                title: "동아리활동"
            },
            {
                grade: 3,
                content: '당해학년도 학교생활기록은 제공하지 않습니다.',
                question: '',
                title: "진로활동"
            },
        ]
    }
    function splitArrayElements(array) {
        const result = [];
        for (const item of array) {
            const lastIndex = item.lastIndexOf('. ');
            if (lastIndex !== -1) {
                result.push(item.substring(0, lastIndex + 1));
                result.push(item.substring(lastIndex + 2));
            } else {
                result.push(item);
            }
        }
        return result;
    }

    function combineArrayElements(array) {
        const result = [];
        for (let i = 0; i < array.length; i += 2) {
            if (i + 1 < array.length) {
                result.push(`${array[i]}: ${array[i + 1]}`);
            } else {
                result.push(`${array[i]}`);
            }
        }
        return result;
    }


    function parseToJSON(htmlText) {
        // HTML을 파싱하여 JSON 형식으로 변환하는 함수
        function parseHTML(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const tbody = doc.querySelector('.p-datatable-tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            const result = [];
            let grade = null;
            let title = null;
            let content = null;

            rows.forEach((row) => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length === 4) {
                    // 학년 정보 저장
                    grade = parseInt(cells[0].textContent.trim(), 10);
                    title = cells[1].textContent.trim();
                    content = cells[3].textContent.trim();

                    result.push({
                        grade,
                        title,
                        content,
                    });
                } else {
                    // 영역 및 시간 정보 저장
                    title = cells[0].textContent.trim();
                    content = cells[2].textContent.trim();

                    result.push({
                        grade,
                        title,
                        content,
                    });
                }
            });

            return result;
        }

        // JSON 형식으로 변환하는 함수
        function convertToJSON(data) {
            return JSON.stringify(data, null, 2);
        }

        // 주어진 HTML 텍스트를 파싱하여 JSON 형식으로 변환
        const parsedData = parseHTML(htmlText);
        const jsonData = convertToJSON(parsedData);
        return jsonData;
    }
    /* 생기부 업로드 로직 끝 */


    function openAddModal(grade) {
        setModalSubject('');
        setModalContent('');
        setAddModalGrade(grade);
        setAddModalOpen(true);
    }

    function addElement() {
        console.log(modalSubject, modalContent)
        set과세특JSON((prev) => {
            const updatedData = { ...prev };
            updatedData[addmodalGrade][2].push({ content: modalSubject + ': ' + modalContent });
            return updatedData;
        });
        setAddModalOpen(false);
    }

    const handleModalSubjectChange = (e) => {
        setModalSubject(e.target.value);
    }

    const handleModalContentChange = (e) => {
        setModalContent(e.target.value);
    }

    function deleteElement(grade, category, index) {
        if (confirm('정말 삭제할까요?')) {
            set과세특JSON((prev) => {
                const updatedData = { ...prev };
                updatedData[grade][category].splice(index, 1);
                return updatedData;
            });
        }
    }

    const handle자동진EditChange = (index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;

        set자동진JSON((prev) => {
            const updatedData = [...prev];
            updatedData[index].content = e.value;
            return updatedData;
        });
    };

    const handle과세특EditChange = (grade, category, index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;
        set과세특JSON((prev) => {
            const updatedData = { ...prev };

            updatedData[grade][category][index] = { content: e.value, question: '' };

            return updatedData;
        });
    };

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
        if (session.user?.id) {
            updateDoc(doc(db, "users", session.user?.id), {
                commonQuestions: commonQuestions,
                sanggibu_name: name || '',
                sanggibu_자동진: 자동진JSON || [],
                sanggibu_과세특: 과세특JSON || []
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
        var newArr = ['공통질문', '1학년_자율활동', '1학년_동아리활동', '1학년_진로활동', '2학년_자율활동', '2학년_동아리활동', '2학년_진로활동', '3학년_자율활동', '3학년_동아리활동', '3학년_진로활동']
        if (!과세특JSON) return null;
        Object.keys(과세특JSON).map((grade) => {
            {
                Object.keys(과세특JSON[grade]).map((category) => {
                    {
                        과세특JSON[grade][category].map((item, index) => {
                            if (item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.') || !item.content) {
                                return null;
                            }
                            newArr.push(`${grade}학년_${item.content.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').split(': ')[0]}`)
                        })
                    }
                })
            }
        })

        setIndexArr(newArr);
    }

    function addCommonQuestion() {
        setCommonQuestions((prev) => {
            const updatedData = [...prev];
            updatedData.push(addCommonQuestionText);
            if (updatedData && session.user?.id) {
                updateDoc(doc(db, "users", session.user?.id), {
                    commonQuestions: updatedData,
                }).then(() => {
                    console.log("Document written with ID: ", session.user?.id);
                }).catch((error) => {
                    console.error("Error adding document: ", error);
                });
            }
            return updatedData;
        });
        setAddCommonQuestionModalOpen(false);
        setAddCommonQuestionText('');
    }

    function deleteCommonQuestion(index) {
        if (confirm('질문을 삭제할까요?')) {
            setCommonQuestions((prev) => {
                const updatedData = [...prev];
                updatedData.splice(index, 1);
                if (updatedData && session.user?.id) {
                    updateDoc(doc(db, "users", session.user?.id), {
                        commonQuestions: updatedData,
                    }).then(() => {
                        console.log("Document written with ID: ", session.user?.id);
                    }).catch((error) => {
                        console.error("Error adding document: ", error);
                    });
                }
                return updatedData;
            });
        }
    }

    const handle자동진MemoEdit = (index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;

        set자동진JSON((prev) => {
            const updatedData = [...prev];
            updatedData[index].memo = e.value;
            return updatedData;
        });
    }

    const handle과세특MemoEdit = (grade, category, index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;

        set과세특JSON((prev) => {
            const updatedData = { ...prev };
            updatedData[grade][category][index].memo = e.value;
            return updatedData;
        });
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
            {session && <>
                <button onClick={openIndexModal} className={`scroll-top-btn`} style={{ bottom: '150px' }}>
                    <IonIcon name="list-outline" size="large" />
                </button>
                <button onClick={() => setOCRModalOpen(true)} className={`scroll-top-btn`} style={{ bottom: '200px' }}>
                    <IonIcon name="camera-outline" size="large" />
                </button>
            </>}
            <main className={`${styles.main}`}>
                <Sidebar />
                <br></br>

                {!session && <div className="outer-sidebar without-nav">
                    <h2>반가워요 :)<br></br>로그인하고 시작해보세요.</h2>
                    <LoginBtn />
                </div>}

                <div className="outer-sidebar">
                    {session && <>
                        <button className='red' id="only-mobile" onClick={() => [signOut()]}
                            style={{ float: 'right', marginTop: '10px' }}>로그아웃</button>
                        <h2 id="only-mobile">내 생기부</h2>
                        <div className="sanggibu-card" style={{ padding: "15px 20px", textAlign: 'center', }}>
                            {!(name && 자동진JSON && 과세특JSON) && <>
                                <Image src='/document-upload.svg' width={0} height={0} sizes="100vw" className="big-image" alt="upload"></Image>
                                <p><a target="_blank" href="https://slashpage.com/uniterview/uploadguide" style={{ color: '#5272ff', textDecoration: 'underline' }}>생기부 업로드 가이드</a>를 읽고 오른쪽 위의 생기부 업로드 버튼을 눌러 업로드해주세요.</p>
                                <button onClick={() => setUploadModalOpen(true)}>생기부 업로드</button>
                            </>}
                            {(name && 자동진JSON && 과세특JSON) && <div style={{ textAlign: 'left' }}>
                                <p>- 아래에서 생기부 내용과 항목 별 질문을 만들 수 있어요.</p>
                                <p>- 3학년 생활기록부가 아직 반영되지 않은 경우 직접 입력해주세요.</p>
                                <button onClick={() => setUploadModalOpen(true)}>새로운 생기부 업로드</button>
                            </div>}
                        </div>


                        <h3 style={{ marginLeft: '10px' }} id='공통질문'>공통 질문</h3>
                        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                            {commonQuestions && commonQuestions.map((item, index) => {
                                return (
                                    <div key={index} className="analysis-container question-card" style={{ borderRadius: '15px', margin: '5px 5px 5px 0', fontSize: '13px', padding: '0 20px', width: 'fit-content' }}>
                                        <h3>Q. {item}</h3>
                                        <button onClick={() => deleteCommonQuestion(index)}><IonIcon name='close' /></button>
                                    </div>
                                )
                            })
                            }
                        </div>
                        <br></br>
                        <button onClick={() => setAddCommonQuestionModalOpen(true)}><IonIcon name='add' />&nbsp;질문 추가</button>


                        <br></br> <br></br><br></br> <br></br>

                        {(name && 자동진JSON && 과세특JSON) ? <>
                            <h3 style={{ marginLeft: '10px' }}>자율/동아리/진로</h3>
                            {자동진JSON &&
                                자동진JSON.map((item, index) => {
                                    return (
                                        <div key={index} className="analysis-container" id={`${item.grade}학년_${item.title}`}>
                                            <div className="analysis-left">
                                                <div className="analysis-card" style={{ height: '100%' }}>
                                                    <h4>{item.grade}학년 {item.title}</h4>
                                                    <textarea
                                                        value={item.content}
                                                        onChange={(e) => handle자동진EditChange(index, e.target)}
                                                        spellCheck="false"
                                                        autoComplete="off"
                                                    />
                                                    <textarea
                                                        className="memo-textarea"
                                                        placeholder="메모ㅡ내용 중 기억해야 할 이론이나 배우고 느낀 점 등"
                                                        value={item.memo}
                                                        onChange={(e) => handle자동진MemoEdit(index, e.target)}
                                                        spellCheck="false"
                                                        autoComplete="off"
                                                    />
                                                </div>

                                            </div>
                                            <div className="analysis-right">
                                                {item.question && item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').replace('undefined[end]', '').trim().split('[end]').map((question, index2) => {
                                                    if (index2 == item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').replace('undefined[end]', '').trim().split('[end]').length - 1) return null;
                                                    if (question.length < 2) return null;
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
                            {과세특JSON &&
                                Object.keys(과세특JSON).map((grade) => {
                                    return (
                                        <div key={grade}>
                                            <br></br>
                                            <h3 style={{ paddingLeft: '15px' }}>{grade}학년 과세특</h3>


                                            {Object.keys(과세특JSON[grade]).map((category) => {
                                                return (
                                                    <div key={category}>
                                                        {과세특JSON[grade][category].map((item, index) => {
                                                            if (item.content.includes('당해학년도 학교생활기록은 제공하지 않습니다.') || !item.content) {
                                                                return (<></>
                                                                );
                                                            }
                                                            return (
                                                                <div key={index} className="analysis-container" id={item.content && `${grade}학년_${item.content.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').replace(' ', '').split(':')[0]}`}>
                                                                    <div className="analysis-left">
                                                                        <div className="analysis-card" style={{ height: '100%' }}>
                                                                            <textarea
                                                                                value={item.content}
                                                                                onChange={(e) => handle과세특EditChange(grade, category, index, e.target)}
                                                                                spellCheck="false"
                                                                                autoComplete="off"
                                                                            />
                                                                            <textarea
                                                                                className="memo-textarea"
                                                                                placeholder="메모ㅡ내용 중 기억해야 할 이론이나 배우고 느낀 점 등" value={item.memo}
                                                                                onChange={(e) => handle과세특MemoEdit(grade, category, index, e.target)}
                                                                                spellCheck="false"
                                                                                autoComplete="off"
                                                                            /><br></br><br></br>
                                                                            <button className="transparent" onClick={() => deleteElement(grade, category, index)}><IonIcon name="trash-outline" />&nbsp;&nbsp;과목 삭제</button>

                                                                        </div>
                                                                    </div>
                                                                    <div className="analysis-right">
                                                                        {item.question && item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').replace('undefined[end]', '').split('[end]').map((question, index2) => {
                                                                            if (index2 == item.question.replaceAll('1. ', '').replaceAll('2. ', '').replaceAll('3. ', '').replace('undefined', '').replace('undefined[end]', '').split('[end]').length - 1) return null;
                                                                            if (question.length < 2) return null;
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

                                            <button onClick={() => openAddModal(grade)} style={{ marginTop: '-30px' }}><IonIcon name='add' />&nbsp;{grade}학년 과목 추가</button>
                                            <br></br><br></br><hr style={{ opacity: 0.3 }}></hr>
                                        </div>
                                    );
                                })
                            }

                        </> : <>생기부를 아직 업로드하지 않았네요. 업로드 전에는 공통 질문만 추가할 수 있어요.<br></br><br></br><br></br><br></br><br></br><br></br></>}
                    </>}
                </div>

                {session && <div className="navigation-sidebar">
                    <h3>빠른 탐색</h3>
                    <div style={{ overflowY: 'auto' }}>
                        {indexArr && indexArr.map((item, key) => {
                            return (<>
                                <a key={key} href={`#${item.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').replace(/\s*/g, "").replace(/\n/g, "")}`} onClick={() => setIndexModalOpen(false)}>{item}<IonIcon name="chevron-forward-outline" /></a><br></br><br></br>
                            </>)
                        })}
                    </div>
                </div>}

                <BottomSheet open={uploadModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => setUploadModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h3>업로드 전 확인해주세요!</h3>
                        <span style={{ color: 'red' }}><IonIcon name="warning"></IonIcon>&nbsp;생활기록부에서 자율/진로/동아리, 과세특 기재 내용만 사용자의 기기에서 안전하게 처리한 후 서버에 저장됩니다. AI 서비스 이용 시 제3자에게 생기부 내용이 전송될 수 있습니다.</span>
                        <label for="onlyValid">자세한 내용은 <a href="https://slashpage.com/uniterview/privacy" target="_blank" style={{ textDecoration: 'underline' }}>개인정보 처리방침</a>을 확인해주세요.</label>
                        <br></br>

                        <input type="file" id="file" accept=".html, .htm, .pdf" onChange={(e) => [handleUpload(e), e.target.value = '']} />
                        <label for="file">동의합니다</label>

                    </div>

                </BottomSheet>

                <BottomSheet open={addModalOpen} expandOnContentDrag={false} onDismiss={() => setAddModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h3>생기부 항목 추가</h3>
                        <input placeholder="과목명" value={modalSubject} onChange={(e) => handleModalSubjectChange(e)}></input>
                        <textarea placeholder="내용" value={modalContent} onChange={(e) => handleModalContentChange(e)}></textarea>
                        <button onClick={() => addElement()}>추가</button>
                    </div>
                </BottomSheet>

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


                <BottomSheet open={addQuestioMmodalOpen} expandOnContentDrag={false} onDismiss={() => setAddQuestionModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h3>질문 추가</h3>
                        <input placeholder="질문을 입력하세요" value={addQuestionText} onChange={(e) => setAddQuestionText(e.target.value)}></input>
                        <button onClick={() => addQuestion()}>추가</button>
                    </div>
                </BottomSheet>


                <BottomSheet open={addCommonQuestionModalOpen} expandOnContentDrag={false} onDismiss={() => setAddCommonQuestionModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h3>공통 질문 추가</h3>
                        <input placeholder="질문을 입력하세요" value={addCommonQuestionText} onChange={(e) => setAddCommonQuestionText(e.target.value)}></input>
                        <button onClick={() => addCommonQuestion()}>추가</button>
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

                <BottomSheet open={ocrModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => setOCRModalOpen(false)}>
                    <div className="bottom-sheet">
                        <Ocr></Ocr>
                    </div>
                </BottomSheet>

                <BottomSheet open={indexModalOpen} expandOnContentDrag={false} onDismiss={() => setIndexModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h2>빠른 탐색</h2>
                        <div style={{ height: '70dvh', overflowY: 'auto' }}>
                            {indexArr && indexArr.map((item, key) => {
                                return (<>
                                    <a key={key} href={`#${item.replace('미래식량과 나의진로', '개세특: ').replace('자율교육과정 국제문제 프로젝트', '개세특: ').replace(' ', '').replace(/\n/g, "")}`} onClick={() => setIndexModalOpen(false)}>{item}<IonIcon name="chevron-forward-outline" /></a><br></br><br></br>
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