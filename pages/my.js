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
    const [html, setHtml] = useState('');
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [자동진JSON, set자동진JSON] = useState('');
    const [과세특JSON, set과세특JSON] = useState('');
    const [lastSaveTime, setLastSaveTime] = useState('');
    const [isChanged, setIsChanged] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalGrade, setModalGrade] = useState('');
    const [modalSubject, setModalSubject] = useState('');
    const [modalContent, setModalContent] = useState('');

    const [indexModalOpen, setIndexModalOpen] = useState(false);
    const [indexArr, setIndexArr] = useState(null)

    const db = firestore;

    useEffect(() => {
        if (session) {
            //유저 정보 불러오기
            const docRef = doc(db, "users", session.user?.id);
            getDoc(docRef).then((doc) => {
                if (doc.exists()) {
                    setName(doc.data().sanggibu_name);
                    set자동진JSON(doc.data().sanggibu_자동진);
                    set과세특JSON(doc.data().sanggibu_과세특);
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
    }, [자동진JSON, 과세특JSON])

    const handleUpload = (event) => {
        const file = event.target.files[0];
        console.log(file)
        if (file) {
            console.clear()
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
                toast.success('생기부 업로드 성공!');
                save();
            }
            reader.readAsText(file);
        }
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

    const handle자동진EditChange = (index, e) => {
        e.style.height = 'auto';
        let height = e.scrollHeight;
        e.style.height = `${height + 8}px`;
        setIsChanged(true);
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
        setIsChanged(true);
        set과세특JSON((prev) => {
            const updatedData = { ...prev };

            updatedData[grade][category][index] = {content: e.value, question: ''};

            return updatedData;
        });
    };

    function save() {
        if (name && 자동진JSON && 과세특JSON && session.user?.id) {
            updateDoc(doc(db, "users", session.user?.id), {
                sanggibu_name: name,
                sanggibu_자동진: 자동진JSON,
                sanggibu_과세특: 과세특JSON
            }).then(() => {
                console.log("Document written with ID: ", session.user?.id);
                toast.success('저장했어요');
                setIsChanged(false);
                setLastSaveTime(moment().format('YY-MM-DD HH:mm:ss'));
            }).catch((error) => {
                console.error("Error adding document: ", error);
                toast.error('저장에 실패했어요');
            });
        }
    }

    function openAddModal(grade) {
        setModalSubject('');
        setModalContent('');
        setModalGrade(grade);
        setModalOpen(true);
    }

    function addElement() {
        setIsChanged(true);
        set과세특JSON((prev) => {
            const updatedData = { ...prev };
            updatedData[modalGrade][1].unshift({ content: modalSubject + ': ' + modalContent });
            return updatedData;
        });
        setModalOpen(false);
    }

    const handleModalSubjectChange = (e) => {
        setModalSubject(e.target.value);
    }

    const handleModalContentChange = (e) => {
        setModalContent(e.target.value);
    }

    function deleteElement(grade, category, index) {
        if (confirm('정말 삭제할까요?')) {
            setIsChanged(true);
            set과세특JSON((prev) => {
                const updatedData = { ...prev };
                updatedData[grade][category].splice(index, 1);
                return updatedData;
            });
        }
    }

    const openIndexModal = () => {
        setIndexModalOpen(true);
        save();
        var newArr = ['1학년_자율활동', '1학년_동아리활동', '1학년_진로활동', '2학년_자율활동', '2학년_동아리활동', '2학년_진로활동', '3학년_자율활동', '3학년_동아리활동', '3학년_진로활동']
        if(!과세특JSON) return null;
        Object.keys(과세특JSON).map((grade) => {
            return (
                <div key={grade}>
                    <br></br>
                    <h3>{grade}학년&nbsp;&nbsp;&nbsp;&nbsp;<button onClick={() => openAddModal(grade)}>항목 추가</button></h3>

                    {Object.keys(과세특JSON[grade]).map((category) => {
                        return (
                            <div key={category}>
                                {과세특JSON[grade][category].map((item, index) => {
                                    if(!item.content) {
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
                <title>유니터뷰 - 내 생기부</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <button onClick={openIndexModal} className={`scroll-top-btn`} style={{bottom: '75px'}}>
            <IonIcon name="list-outline" size="large" />
        </button>
            <main className={`${styles.main}`}>

                <header>
                    <div className="header-left">
                        <IonIcon name='chevron-back-outline' onClick={() => router.replace('/')} /> <h3 className="header-title">내 생기부</h3>
                    </div>
                    <div className="header-right">
                        {lastSaveTime && <p className="subText">{lastSaveTime}에 저장됨</p>}
                        {isChanged && <p className="subText">변경사항 있음</p>}
                        <input type="file" id="file" onChange={handleUpload} />
                        <label for="file">{(name && 자동진JSON && 과세특JSON) ? "새로운 생기부 업로드" : "생기부 업로드"}</label>
                        {(name && 자동진JSON && 과세특JSON) && <button onClick={() => save()}>저장</button>}
                    </div>
                </header>


                <br></br><br></br><br></br>
                <div className="sanggibu-card" style={{ padding: "15px 20px", textAlign: 'center', }}>
                    {!(name && 자동진JSON && 과세특JSON) && <>
                        <Image src='/document-upload.svg' width={0} height={0} sizes="100vw" className="big-image" alt="upload"></Image>
                        <p>- 오른쪽 위의 "생기부 업로드" 버튼을 눌러 NEIS+에서 다운로드한 html 또는 htm 파일을 업로드해주세요.</p>
                        <a target="_blank" href="https://slashpage.com/uniterview/7xjqy1g2v8kxn26vd54z"><button>[필독] 생기부 업로드 가이드 <IonIcon name="chevron-forward-outline" /></button></a>
                    </>}
                    {(name && 자동진JSON && 과세특JSON) && <div style={{textAlign: 'left'}}>
                        <p>- 아래 항목을 확인하고 수정이 필요한 경우 수정 후 저장해주세요. 수정 시 해당 항목에 대한 질문은 삭제됩니다.</p>
                        <p>- 3학년 생활기록부가 아직 반영되지 않은 경우 직접 입력해주세요. 정확한 기입 내용을 모르는 경우 담임선생님께 문의하거나 본인이 알고 있는 대략적인 활동 내용을 작성해주세요.</p>
                    </div>}
                </div>


                {(name && 자동진JSON && 과세특JSON) ? <>
                    <h2>{name} 학생의 생기부</h2>

                    <hr></hr>
                    <h3>자율/동아리/진로</h3>
                    {자동진JSON &&
                        자동진JSON.map((item, index) => {
                            return (
                                <div key={index} className="jadongjin-card" id={`${item.grade}학년_${item.title}`}>
                                    <h4>{item.grade}학년 {item.title}</h4>
                                    <textarea
                                        value={item.content}
                                        onChange={(e) => handle자동진EditChange(index, e.target)}
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
                                    <h3>{grade}학년&nbsp;&nbsp;&nbsp;&nbsp;<button onClick={() => openAddModal(grade)}>항목 추가</button></h3>

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
                                                                value={item.content}
                                                                onChange={(e) => handle과세특EditChange(grade, category, index, e.target)}
                                                                spellCheck="false"
                                                                autoComplete="off"
                                                            />
                                                            <button className="transparent" onClick={() => deleteElement(grade, category, index)}>삭제&nbsp;&nbsp;<IonIcon name="trash-outline" /></button>
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
                <BottomSheet open={modalOpen} expandOnContentDrag={true} onDismiss={() => setModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h3>항목 추가</h3>
                        <input placeholder="과목명" value={modalSubject} onChange={(e) => handleModalSubjectChange(e)}></input>
                        <textarea placeholder="내용" value={modalContent} onChange={(e) => handleModalContentChange(e)}></textarea>
                        <button onClick={() => addElement()}>추가</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={indexModalOpen} expandOnContentDrag={true} onDismiss={() => setIndexModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h2>빠른 탐색</h2>
                        <div style={{height: '70dvh', overflowY: 'auto'}}>
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
