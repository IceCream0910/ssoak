"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../../components/common/headTag'
import Spacer from '../../components/common/spacer';
import moment from 'moment';
import Image from 'next/image';
import { firestore, auth } from "../../firebase/firebase"
import Notice from '../../components/feed/notice';

import IonIcon from '@reacticons/ionicons';
import { collection, getDocs, getDoc, doc, query, orderBy, limitToLast, setDoc, endBefore, where } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';


export default function Community() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const observer = useRef();

    const [isLoggedin, setIsLoggedin] = useState(false);
    const [myUserData, setMyUser] = useState(null);


    const fetchData = async () => {
        if (isLoading) return;
        setIsLoading(true);

        console.log("fetch more posts", lastDoc)

        const nextQuery = lastDoc ? query(
            collection(firestore, "board"),
            orderBy("createdAt"),
            limitToLast(8),
            endBefore(lastDoc)
        ) : query(
            collection(firestore, "board"),
            orderBy("createdAt"),
            limitToLast(8)
        );

        const querySnapshot = await getDocs(nextQuery);
        const tempList = [];

        for (const doc of querySnapshot.docs) {
            let data = doc.data();
            data.id = doc.id;

            const response = await fetch(`/api/user/${data.userId}`);
            const userData = await response.json();

            tempList.push({
                ...data,
                nickname: userData.nickname,
                profileImg: userData.profileImg,
                admin: userData.admin
            });
        }

        setLastDoc(querySnapshot.docs[0]);
        tempList.reverse();
        setData(prevData => [...prevData, ...tempList]);
        setIsLoading(false);
    };


    useEffect(() => {
        const intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading && lastDoc) {
                fetchData();
            }
        }, { threshold: 1 });

        if (observer.current) {
            intersectionObserver.observe(observer.current);
        }

        return () => intersectionObserver.disconnect();
    }, [isLoading, lastDoc]);

    useEffect(() => {
        fetchData();
        checkAuth();



    }, []);


    function checkAuth() {
        const auth = getAuth();
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("user is logged in", user);
                updateUserData(user);
                setIsLoggedin(true);

            } else {
                console.log("user is not logged in");
                setIsLoggedin(false);
            }
        });
    }

    async function updateUserData(user) {
        const query = await getDoc(doc(firestore, 'users', user.uid));
        const data = query.data();

        if (!data) {
            //새로운 유저
            await setDoc(doc(firestore, 'users', user.uid), {
                uid: user.uid,
                nickname: user.displayName,
                email: user.email,
                profileImg: Math.floor(Math.random() * 5),
                admin: false
            });

            setMyUser({
                uid: user.uid,
                nickname: user.displayName,
                email: user.email,
                profileImg: Math.floor(Math.random() * 5),
                admin: false
            });
            console.log('새로운 유저 가입됨')
        } else {
            setMyUser(data);
        }

    }

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        try {
            const user = await signInWithPopup(auth, provider);
            console.log(user);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        if (confirm('정말 로그아웃 하시겠습니까?')) {
            const auth = getAuth();
            try {
                await auth.signOut();
                console.log("user is logged out");
                setIsLoggedin(false);
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <>
            <HeadTag title="커뮤니티" />
            <Toaster />

            <main>
                <header>
                    {
                        isLoggedin ? <div style={{ width: "95%", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {myUserData &&
                                <div onClick={() => router.push('/community/profile/' + myUserData.uid)}
                                    style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
                                    <img src={`icons/profileImg/letter${myUserData.profileImg || 1}.png`} className="profile-img" />
                                    <h3>{myUserData.nickname}</h3>
                                </div>
                            }

                            <button className="red" onClick={handleLogout}>로그아웃</button>
                        </div>
                            :
                            <>
                                <button onClick={handleGoogleLogin}>로그인</button>
                            </>

                    }

                </header>
                <Spacer y={70} />

                <Notice />
                <Spacer y={15} />

                {data && data.map((item, index) => {
                    if (item.category == '공지') return;
                    return (
                        <div className="post-item" onClick={() => router.push(`/community/${item.id}`)} data-createdat={item.createdAt.toDate().getTime()}>
                            <div>
                                <div className="post-header">
                                    <img src={`icons/profileImg/letter${item.profileImg || 1}.png`} className="profile-img" />
                                    <span id="uname">{(item.admin) ?
                                        <span>{item.nickname}&nbsp;
                                            <IonIcon name="checkmark-circle" style={{ position: 'relative', top: '2px', color: 'var(--button-text)' }} /></span>
                                        : (item.nickname || '(어디론가 사라진 사용자)')}<br />
                                        <span style={{ opacity: 0.7 }}>{moment(item.createdAt.toDate()).format('YYYY-MM-DD')}</span>
                                    </span>
                                </div>
                                <h3 id="post-title">{item.title}</h3>
                                <Spacer y={10} />
                                <div className="post-preview">
                                    {item.content.length > 50 ? `${item.content.slice(0, 50)}...` : item.content.replace('?vote?', '투표를 확인하세요')}
                                </div>
                                <div id={`choices-list-${item.id}`} style={{ width: '100%' }}></div>
                                {item.image && <><Spacer y={20} />
                                    <img src={item.image[0]} className="post-image" />
                                </>}
                                <Spacer y={20} />
                                <span style={{ color: 'var(--button-text)', fontSize: '15px', marginTop: '10px', opacity: .7 }}>더보기</span>
                                <Spacer y={30} />
                            </div>
                        </div>
                    );
                })}
                <div ref={observer} style={{ height: "50px" }} />

                {isLoggedin &&
                    <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 99 }}>
                        <button onClick={() => router.push('/community/write')}
                            style={{ backgroundColor: 'var(--active-color)', color: '#fff', padding: '0 15px 0 10px', borderRadius: '20px', boxShadow: '10px 10px 20px -10px var(--active-color)' }}>
                            <IonIcon name="add" style={{ fontSize: '20px' }} />&nbsp;글쓰기
                        </button>
                    </div>
                }

                {isLoading && <>
                    <div className="post-item">
                        <div className="skeleton-loader"></div><Spacer y={10} />
                    </div>
                    <Spacer y={15} />
                    <div className="post-item">
                        <div className="skeleton-loader"></div><Spacer y={10} />
                    </div>
                    <Spacer y={15} />
                    <div className="post-item">
                        <div className="skeleton-loader"></div><Spacer y={10} />
                    </div>
                    <Spacer y={15} />
                    <div className="post-item">
                        <div className="skeleton-loader"></div><Spacer y={10} />
                    </div>
                </>
                }
                <Spacer y={100} />
            </main >

            <style jsx>{`

header {
    position: fixed;
    right: 0;
    top: 0;
    z-index: 99;
    display: flex;
    padding: 10px;
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
    margin-bottom: 15px;
    padding: 10px 20px 0 20px;
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

.profile-img {
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