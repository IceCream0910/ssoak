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
import { query, getDoc, doc, collection, orderBy, getDocs, Timestamp, addDoc, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'

export default function Community() {
    const [currentUserId, setCurrentUserId] = useState(null);
    const router = useRouter();
    const [user, setUser] = useState([]);
    const id = router.query.id;
    const [posts, setPosts] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        checkAuth();
        fetchData();
    }, [id]);

    async function fetchData() {
        if (!id) return;
        const response = await fetch(`/api/user/${id}`);
        const userData = await response.json();
        setUser(userData);
    }

    function checkAuth() {
        const auth = getAuth();
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("user is logged in", user);
                setCurrentUserId(user.uid);
            } else {
                alert('로그인이 필요한 서비스입니다');
                router.back();
            }
        });
    }

    useEffect(() => {
        if (!currentUserId) return;
        if (currentUserId != id) {
            alert('권한이 없습니다');
            router.back();
        }
        fetchUserPosts();
    }, [currentUserId]);

    async function fetchUserPosts() {
        console.log(currentUserId);
        const collectionRef = collection(firestore, "board");
        const querySnapshot = await getDocs(
            query(collectionRef, orderBy("createdAt"), where("userId", "==", currentUserId))
        );
        const tempList = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tempList.push({
                ...data,
                id: doc.id
            });
        });

        console.log(tempList)

        setPosts(tempList);
    }

    async function updateProfileImg(imgNum) {
        await updateDoc(doc(firestore, "users", currentUserId), {
            profileImg: imgNum
        });
        toast.success('프로필 사진이 변경되었습니다');
        fetchData();
    }

    async function randomNickname() {
        await fetch('/api/user/random_nick')
            .then(res => res.json())
            .then(data => {
                document.querySelector('input').value = data.result;
            });
    }

    async function save() {
        const nickname = document.querySelector('input').value;
        if (nickname == '' || nickname == ' ' || nickname == null || nickname == undefined || nickname == '  ') {
            toast('기존 닉네임을 그대로 사용합니다.');
            setIsEditModalOpen(false);
        } else {
            if (await checkNicknameDuplicate(nickname)) {
                await updateDoc(doc(firestore, "users", currentUserId), {
                    nickname: nickname
                });
                toast.success('닉네임이 변경되었습니다.');
                setIsEditModalOpen(false);
                fetchData();
            } else {
                toast.error('이미 사용중인 닉네임입니다.');
                return;
            }
        }
    }

    async function checkNicknameDuplicate(nickname) {
        try {
            const querySnapshot = await getDocs(query(collection(firestore, "users"), where("nickname", "==", nickname)));
            return querySnapshot.size === 0;
        } catch (err) {
            return false;
        }
    }



    return (
        <>
            <HeadTag title={'내 프로필 | ' + user.nickname} />
            <Toaster />

            <main>
                <header>
                    <IonIcon name="chevron-back" onClick={() => router.back()} style={{ fontSize: '25px', cursor: 'pointer' }} />&nbsp;내 프로필
                </header>
                <Spacer y={50} />

                {user && <>
                    <div className="post-header">
                        <img src={`../../icons/profileImg/letter${user.profileImg || 1}.png`} className="profile-img" style={{ width: '60px', height: '60px', borderRadius: '25px' }} />
                        <span id="uname" style={{ fontSize: '20px' }}>{(user.admin) ?
                            <span>{user.nickname}&nbsp;
                                <IonIcon name="checkmark-circle" style={{ position: 'relative', top: '2px', color: 'var(--button-text)' }} /></span>
                            : <span>{user.nickname}</span>}
                        </span>
                    </div>
                    <button onClick={() => setIsEditModalOpen(true)}>프로필 수정</button>
                </>
                }

                <Spacer y={20} />
                <h3>내가 쓴 글</h3>
                {posts && posts.map((post, index) => (
                    <div className="post-item" key={index} onClick={() => window.open(`/community/${item.id}`, '_blank')}>
                        <div className="post-header">
                            <img src={`../../icons/profileImg/letter${user.profileImg || 1}.png`} className="profile-img" />
                            <span id="uname">{user.nickname}</span>
                        </div>
                        <h3 id="post-title">{post.title}</h3>
                        <Spacer y={10} />
                        <div className="post-preview">
                            {post.content.length > 50 ? `${post.content.slice(0, 50)}...` : post.content.replace('?vote?', '투표를 확인하세요')}
                        </div>
                        <div id={`choices-list-${post.id}`} style={{ width: '100%' }}></div>
                        {post.image && <><Spacer y={20} />
                            <img src={post.image[0]} className="post-image" />
                        </>}
                        <Spacer y={20} />
                        <span style={{ color: 'var(--button-text)', fontSize: '15px', marginTop: '10px', opacity: .7 }}>더보기</span>
                        <Spacer y={30} />
                    </div>
                ))}

                {!posts || posts.length == 0 && <div style={{ textAlign: 'center', opacity: .5, width: "calc(100% + 40px)" }}>
                    <Spacer y={20} />
                    <IonIcon style={{ fontSize: '50px' }} name={'scan-outline'} />
                    <Spacer y={10} />
                    <span>아직 작성한 글이 없어요</span>
                </div>}

                <BottomSheet open={isEditModalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setIsEditModalOpen(false)}>
                    <div className="bottom-sheet">
                        <h2>프로필 수정</h2><Spacer y={20} />
                        <span style={{ opacity: .5 }}>닉네임</span><Spacer y={10} />
                        <input style={{ paddingRight: '80px' }} placeholder={user.nickname}></input>
                        <button onClick={() => randomNickname()} style={{ position: 'absolute', top: '120px', right: '25px' }}><IonIcon style={{ fontSize: '20px' }} name="shuffle" /></button>
                        <Spacer y={30} />
                        <span style={{ opacity: .5 }}>프로필 사진</span><Spacer y={10} />
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'space-between', overflowX: 'auto', width: '100%' }}>
                            <img onClick={() => updateProfileImg(1)} src={`../../icons/profileImg/letter1.png`} className="profile-img" style={{ width: '60px', height: '60px', borderRadius: '25px', opacity: user.profileImg === 1 ? 1 : 0.2 }} />
                            <img onClick={() => updateProfileImg(2)} src={`../../icons/profileImg/letter2.png`} className="profile-img" style={{ width: '60px', height: '60px', borderRadius: '25px', opacity: user.profileImg === 2 ? 1 : 0.2 }} />
                            <img onClick={() => updateProfileImg(3)} src={`../../icons/profileImg/letter3.png`} className="profile-img" style={{ width: '60px', height: '60px', borderRadius: '25px', opacity: user.profileImg === 3 ? 1 : 0.2 }} />
                            <img onClick={() => updateProfileImg(4)} src={`../../icons/profileImg/letter4.png`} className="profile-img" style={{ width: '60px', height: '60px', borderRadius: '25px', opacity: user.profileImg === 4 ? 1 : 0.2 }} />
                            <img onClick={() => updateProfileImg(5)} src={`../../icons/profileImg/letter5.png`} className="profile-img" style={{ width: '60px', height: '60px', borderRadius: '25px', opacity: user.profileImg === 5 ? 1 : 0.2 }} />
                        </div>
                        <Spacer y={30} />
                        <button onClick={() => save()}>저장</button>
                    </div>
                </BottomSheet>

            </main >

            <style jsx>{`
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
    padding-top: 10px;
    padding-bottom :0;
    border-radius: 20px;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    -webkit-transition: .5s;
    -moz-transition: .5s;
    -o-transition: .5s;
    transition: .5s
}

.post-item:active {
    transform: scale(.98)

}
.post-header {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    font-size: 14px;
    margin-bottom: 20px;
    margin-top: 10px
}

.post-header .profile-img {
    width: 35px;
    height: 35px;
    border-radius: 15px
}

#post-title {
    margin: 0;
    font-weight: 600;
    font-size: 20px;
}

.post-item .post-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
    padding-top: 15px;
    border-top: 1px solid #d60000
}

.post-item #post-content {
    font-size: 15px;
    color: #000;
    opacity: .8
}

.post-preview {
    border-radius: 10px;
    opacity: 0.8;
}

.post-image {
    width: 40%;
    height: 120px;
    border-radius: 10px;
    margin-bottom: 10px;
    object-fit: cover;
}
            `}
            </style>
        </>
    )
}