"use client";
import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../components/common/headTag'
import Spacer from '../components/common/spacer';
import IonIcon from '@reacticons/ionicons';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'
import { firestore, auth } from "../firebase/firebase"
import { collection, getDocs, getDoc, doc, query, orderBy, limitToLast, addDoc, endBefore, where, deleteDoc } from 'firebase/firestore';


export default function Community() {
    const router = useRouter();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [data, setData] = useState([]);

    const [grade, setGrade] = useState(1);
    const [classNum, setClassNum] = useState(1);
    const [detailItem, setDetailItem] = useState(null);

    async function fetchData() {
        const q = query(collection(firestore, `todo_${grade}_${classNum}`), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        let temp = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().grade === grade && doc.data().classNum === classNum) {
                const currentDate = new Date();
                const todoDate = new Date(doc.data().date);
                if (todoDate >= currentDate) {
                    temp.push({ id: doc.id, ...doc.data() });
                }
            }
        });
        setData(temp);
    }

    useEffect(() => {
        const savedGrade = localStorage.getItem('sungil_grade');
        const savedClassNum = localStorage.getItem('sungil_classNum');
        if (savedGrade && savedClassNum) {
            setGrade(savedGrade);
            setClassNum(savedClassNum);
        }



    }, []);

    useEffect(() => {
        if (!grade || !classNum) return;
        fetchData();
    }, [grade, classNum]);

    async function save() {
        const title = document.querySelector('input[placeholder="내용"]').value;
        const date = document.querySelector('input[type="date"]').value;
        const period = document.querySelector('select').value;
        const memo = document.querySelector('textarea').value;

        if (!title || !date || !period) {
            toast.error('내용을 모두 입력해주세요.');
            return;
        }

        await addDoc(collection(firestore, `todo_${grade}_${classNum}`), {
            title: title,
            date: date,
            grade: grade,
            classNum: classNum,
            period: period,
            memo: memo
        });

        toast.success('할일이 추가되었습니다.');
        fetchData();

        document.querySelector('input[placeholder="내용"]').value = '';
        document.querySelector('input[type="date"]').value = '';
        document.querySelector('select').value = '1';
        document.querySelector('textarea').value = '';

        setIsAddModalOpen(false);
    }

    function openDetailModal(item) {
        setDetailItem(item);
        setIsDetailModalOpen(true);
    }

    async function deleteItem(id) {
        if (!confirm('정말로 삭제하시겠습니까?')) return;
        await deleteDoc(doc(firestore, `todo_${detailItem.grade}_${detailItem.classNum}`, id));
        toast.success('할일이 삭제되었습니다.');
        fetchData();
        setIsDetailModalOpen(false);
    }

    return (
        <>
            <HeadTag title={'할일'} />
            <Toaster />

            <main>
                <header>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <h2 style={{ marginLeft: '5px' }}>&nbsp;우리 반 할일</h2>
                        <span style={{ opacity: .5 }}>for {grade}-{classNum}</span>
                    </div>

                </header>
                <Spacer y={70} />

                {!data || data.length == 0 &&
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', width: '100%' }}>
                        <IonIcon name="scan-outline" style={{ fontSize: '50px', opacity: .5 }} />
                        <span style={{ opacity: .5 }}>아직 친구들이 추가한 할일이 없어요</span>
                    </div>
                }

                {data && data.length > 0 && data.map((item, index) => (
                    <div className="post-item" onClick={() => openDetailModal(item)}>
                        <Spacer y={20} />
                        <h3 style={{ margin: 0 }}>{item.title}</h3>
                        <Spacer y={5} />
                        <span style={{ opacity: .5, fontSize: '14px' }}>{item.date} &nbsp;| &nbsp;{item.period}교시</span>
                        <Spacer y={20} />
                    </div>
                ))}



                <Spacer y={100} />
            </main >

            <BottomSheet open={isAddModalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setIsAddModalOpen(false)}>
                <div className="bottom-sheet">
                    <h2>할일 추가</h2><Spacer y={20} />
                    <span style={{ opacity: .5 }}>내용</span><Spacer y={10} />
                    <input placeholder={'내용'}></input>
                    <Spacer y={30} />
                    <span style={{ opacity: .5 }}>날짜</span><Spacer y={10} />
                    <input type="date"></input>
                    <Spacer y={30} />
                    <span style={{ opacity: .5 }}>해당 수업 교시</span><Spacer y={10} />
                    <select>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={'기타'}>기타</option>
                    </select>
                    <Spacer y={30} />
                    <span style={{ opacity: .5 }}>메모 (선택)</span><Spacer y={10} />
                    <textarea></textarea>
                    <Spacer y={30} />
                    <button onClick={() => save()}>저장</button>
                </div>
            </BottomSheet>

            <BottomSheet open={isDetailModalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setIsDetailModalOpen(false)}>
                {detailItem &&
                    <div className="bottom-sheet">
                        <h2>{detailItem.title}</h2>
                        <Spacer y={10} />
                        <span style={{ opacity: .5, fontSize: '14px' }}>{detailItem.date} &nbsp;| &nbsp;{detailItem.period}교시</span>
                        {detailItem.memo && <>
                            <Spacer y={20} />
                            <span style={{ opacity: .5, fontSize: '14px' }}>{detailItem.memo}</span>
                        </>
                        }

                        <Spacer y={20} />
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px' }}>
                            <button className="red" onClick={() => deleteItem(detailItem.id)} style={{ width: '50%' }}>할일 삭제</button>
                            <button onClick={() => setIsDetailModalOpen(false)} style={{ width: '50%' }}>닫기</button>
                        </div>
                    </div>
                }

            </BottomSheet>


            <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 99 }}>
                <button onClick={() => setIsAddModalOpen(true)}
                    style={{ backgroundColor: 'var(--active-color)', color: '#fff', padding: '0 15px 0 10px', borderRadius: '20px', boxShadow: '10px 10px 20px -10px var(--active-color)' }}>
                    <IonIcon name="add" style={{ fontSize: '20px' }} />&nbsp;추가
                </button>
            </div>

            <style jsx>{`
            @media screen and (max-width: 768px) {
                main {
                    width: calc(100% + 40px);
                }
            }

            header {
                position: fixed;
                right: 0;
                top: 0;
                z-index: 99;
                display: flex;
                padding: 20px;
                padding-bottom:0;
                height: 50px;
                align-items: center;
                backdrop-filter: blur(15px) saturate(200%);
                -webkit-backdrop-filter: blur(15px) saturate(200%);
                background-color: var(--background-blur);
                width: calc(100% - 40px);
            }

            .post-item {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: space-between;
                width: 100%;
                background-color: var(--secondary-bg);
                color: var(--text);
                margin-bottom: 20px;
                padding: 20px;
                padding-top: 0;
                padding-bottom :0;
                border-radius: 20px;
                box-sizing: border-box;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    -webkit-transition: .5s;
    -moz-transition: .5s;
    -o-transition: .5s;
    transition: .5s
            }

            .post-item:active {
                transform: scale(0.98);
            }
            
            @media screen and (min-width: 768px) {
                header {
                    width: 75%;
                }
            }
            `}
            </style>
        </>
    )
}