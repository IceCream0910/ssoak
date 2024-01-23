
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../../components/common/headTag'
import Spacer from '../../components/common/spacer';
import moment from 'moment';
import Image from 'next/image';
import { firestore } from "../../firebase/firebase"
import IonIcon from '@reacticons/ionicons';
import { getDoc, doc, collection, orderBy, getDocs, Timestamp, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import dynamic from 'next/dynamic';
const EditorBox = dynamic(() => import('../../components/common/toastEditor'), { ssr: false });
const EditorBoxDark = dynamic(() => import('../../components/common/toastEditorDark'), { ssr: false });

export default function Community() {
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState(null);
    //const editorComponentRef = useRef();
    const [theme, setTheme] = useState('');
    const [mode, setMode] = useState(0);
    const [voteCandidates, setVoteCandidates] = useState([]);


    useEffect(() => {
        checkAuth();
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '');
    }, []);

    function checkAuth() {
        const auth = getAuth();
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("user is logged in", user);
                setCurrentUserId(user.uid);
            } else {
                console.log("user is not logged in");
                toast.error('로그인이 필요합니다');
                router.back();
            }
        });
    }


    async function post() {
        if (mode == 0) {
            const title = document.querySelector('input').value;
            const content = localStorage.getItem('ssoak_editor_content');

            if (!title || !content) {
                toast.error('제목과 내용을 입력해주세요');
                return;
            }

            await addDoc(collection(firestore, 'board'), {
                title: title,
                content: content,
                category: '자유',
                createdAt: Timestamp.now(),
                userId: currentUserId
            });

            localStorage.removeItem('ssoak_editor_content');
            toast.success('게시글이 작성되었습니다');
            router.replace('/community');
        } else { //투표 올리기
            const candidatesInputs = document.querySelectorAll('.candidate-input');
            const newVoteCandidates = Array.from(candidatesInputs).map(input => input.value);

            const filteredVoteCandidates = newVoteCandidates.filter(candidate => candidate.trim() !== '');
            setVoteCandidates(filteredVoteCandidates);


            if (filteredVoteCandidates.length < 2) {
                toast.error('선택지는 최소 2개 이상이어야 합니다');
                return;
            }

            const title = document.querySelector('input').value;
            if (!title) {
                toast.error('제목을 입력해주세요');
                return;
            }

            candidatesInputs.forEach(input => (input.value = ''));
            const options = filteredVoteCandidates.map(candidate => ({ count: 0, title: candidate }));

            const voteData = {
                title: title,
                category: '투표',
                content: '?vote?',
                createdAt: Timestamp.now(),
                userId: currentUserId,
                participants: 0,
                options: options,
            }

            await addDoc(collection(firestore, 'board'), voteData);
            toast.success('투표가 생성되었습니다');

            router.replace('/community');

        }

    }

    return (
        <>
            <HeadTag title={'커뮤니티 | 글쓰기'} />
            <Toaster />

            <main>
                <header>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <IonIcon name="chevron-back" onClick={() => [localStorage.removeItem('ssoak_editor_content'), router.back()]} style={{ fontSize: '25px', cursor: 'pointer' }} />&nbsp;글쓰기

                        {mode == 0 ?
                            <button style={{ position: 'absolute', right: '90px' }} onClick={() => setMode(1)}>투표 만들기</button>
                            :
                            <button style={{ position: 'absolute', right: '90px' }} onClick={() => setMode(0)}>일반 글쓰기</button>}

                        <button style={{ position: 'absolute', right: '20px' }} onClick={() => post()}>게시</button>
                    </div>

                </header>
                <Spacer y={70} />

                <input placeholder='제목'></input>
                {mode == 0 ?
                    <div>
                        <Spacer y={20} />
                        {
                            theme === 'dark' ?
                                <EditorBoxDark />
                                : <EditorBox />
                        }
                    </div>

                    :
                    <div>
                        <Spacer y={20} />
                        {voteCandidates.map((candidate, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    className="candidate-input"
                                    placeholder='선택지 입력'
                                    style={{ width: '100%' }}
                                    value={candidate}
                                    onChange={(e) => {
                                        const newVoteCandidates = [...voteCandidates];
                                        newVoteCandidates[index] = e.target.value;
                                        setVoteCandidates(newVoteCandidates);
                                    }}
                                ></input>
                                <button
                                    style={{ width: '50px', padding: '0', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                                    onClick={() => {
                                        const temp = [...voteCandidates];
                                        temp.splice(index, 1);
                                        setVoteCandidates(temp);
                                    }}
                                >
                                    <IonIcon style={{ fontSize: '20px' }} name="close-outline" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                setVoteCandidates([...voteCandidates, '']);
                            }}
                        >
                            <IonIcon name="add-outline" />&nbsp;선택지 추가
                        </button>
                    </div>}




            </main >

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
                align-items: center;
                backdrop-filter: blur(15px) saturate(200%);
                -webkit-backdrop-filter: blur(15px) saturate(200%);
                background-color: var(--background-blur);
                width: calc(100% - 40px);
            }
            
            @media screen and (min-width: 768px) {
                header {
                    width: 75%;
                }
            }

            input {
                width: 100%;
                border-radius: 15px;
                padding-left: 15px;
                box-sizing: border-box;
            }
            `}
            </style>
        </>
    )
}