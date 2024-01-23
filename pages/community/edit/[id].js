"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../../../components/common/headTag'
import Spacer from '../../../components/common/spacer';
import moment from 'moment';
import Image from 'next/image';
import { firestore } from "../../../firebase/firebase"
import IonIcon from '@reacticons/ionicons';
import { getDoc, doc, collection, orderBy, getDocs, Timestamp, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import dynamic from 'next/dynamic';
const EditorBox = dynamic(() => import('../../../components/common/toastEditor'), { ssr: false });
const EditorBoxDark = dynamic(() => import('../../../components/common/toastEditorDark'), { ssr: false });

export default function Community() {
    const router = useRouter();
    const { id } = router.query;
    const [currentUserId, setCurrentUserId] = useState(null);
    const editorComponentRef = useRef();
    const [theme, setTheme] = useState('');
    const [post, setPost] = useState(null);
    const [preContent, setPreContent] = useState('');

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
            }
        });
    }

    useEffect(() => {
        fetchData();
    }, [currentUserId]);

    async function fetchData() {
        if (!id) return;
        const query = await getDoc(doc(firestore, 'board', id));
        const data = query.data();
        if (!data) return;
        setPost(data);
    }

    useEffect(() => {
        if (!post) return;
        if (currentUserId == post.userId) {
            document.querySelector('input').value = post.title;
            setPreContent(post.content);
        } else {
            toast.error('권한이 없습니다.');
            router.back();
        }
    }, [post]);

    async function edit() {
        const title = document.querySelector('input').value;
        const content = editorComponentRef.current.getMarkdown();
        const category = document.querySelector('select').value || "자유";

        if (!title || !content) {
            toast.error('제목과 내용을 입력해주세요');
            return;
        }

        await updateDoc(doc(firestore, 'board', id), {
            title: title,
            content: content,
            category: category,
        });
        toast.success('게시글이 수정되었습니다.');
        router.back();
    }

    return (
        <>
            <HeadTag title={'커뮤니티 | 게시글 수정'} />
            <Toaster />

            <main>
                <header>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <IonIcon name="chevron-back" onClick={() => router.back()} style={{ fontSize: '25px', cursor: 'pointer' }} />&nbsp;게시글 수정

                        <button style={{ position: 'absolute', right: '20px' }} onClick={() => edit()}>수정</button>
                    </div>

                </header>
                <Spacer y={70} />

                <div>
                    <input placeholder='제목'></input>
                    <Spacer y={10} />
                    <select>
                        <option value="자유">자유</option>
                        <option value="질문">질문</option>
                        <option value="개발">개발자 나와라</option>
                    </select>
                </div>
                <Spacer y={20} />

                {
                    theme === 'dark' ?
                        <EditorBoxDark ref={editorComponentRef} content={preContent} />
                        : <EditorBox ref={editorComponentRef} content={preContent} />
                }


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