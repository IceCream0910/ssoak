"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../../components/common/headTag'
import Spacer from '../../components/common/spacer';
import moment from 'moment';
import Image from 'next/image';
import { firestore, auth } from "../../firebase/firebase"
import IonIcon from '@reacticons/ionicons';
import { getDoc, doc, collection, orderBy, getDocs, Timestamp, addDoc, deleteDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Community() {
    const router = useRouter();
    const [post, setPost] = useState([]);
    const [comments, setComments] = useState([]);
    const id = router.query.id;
    const [currentUserId, setCurrentUserId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [isVote, setIsVote] = useState(false);
    const [myVote, setMyVote] = useState(null);

    const commentInputRef = useRef(null);
    const commentEditorInputRef = useRef(null);

    useEffect(() => {
        checkAuth();
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
    }, [id]);

    async function fetchData() {
        if (!id) return;
        const query = await getDoc(doc(firestore, 'board', id));
        const data = query.data();
        if (!data) return;

        if (data.category === '투표') {
            setIsVote(true);
        }

        let temp;
        const response = await fetch(`/api/user/${data.userId}`);
        const userData = await response.json();

        temp = {
            ...data,
            nickname: userData.nickname,
            profileImg: userData.profileImg,
            admin: userData.admin,
            fcmToken: userData.fcmToken || null
        };

        //댓글 로딩
        const tempList = [];
        const commentsQuery = await getDocs(collection(firestore, 'board', id, 'comments'), orderBy('createdAt'));
        for (const doc of commentsQuery.docs) {
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

        tempList.reverse();
        setComments(tempList);
        setPost(temp);
        console.log(temp)
    }

    useEffect(() => {
        async function fetchCurrentUser() {
            const responseCurrentUser = await fetch(`/api/user/${currentUserId}`);
            const currentUserData = await responseCurrentUser.json();
            console.log(currentUserData)

            if (currentUserData.doneVotes && (currentUserData.doneVotes[id] != null || currentUserData.doneVotes[id] != undefined)) {
                setMyVote(parseInt(currentUserData.doneVotes[id]));
            } else {
                setMyVote(null);
            }
        }

        if (currentUserId) {
            fetchCurrentUser();
        }
    }, [currentUserId]);

    useEffect(() => {
        console.log(myVote);
    }, [myVote]);

    async function postComment() {
        const content = commentInputRef.current.value;
        commentInputRef.current.value = '';

        if (!content) {
            toast.error('댓글을 입력해주세요');
            return;
        }

        const timestamp = Timestamp.fromDate(new Date());
        await addDoc(collection(firestore, 'board', id, 'comments'), {
            userId: currentUserId,
            content: content,
            createdAt: timestamp
        });

        if (post.fcmToken) { //token 존재 -> 푸시 알림 전송
            fetch(`https://sungil-school-api.vercel.app/fcm?key=9pcd01YwxIIO3ZVZWFLN&title=내가 쓴 글에 새로운 댓글이 달렸습니다.&desc=${post.title ? post.title + '에 달린 댓글' : '어떤 댓글이 달렸는지 확인해보세요.'}&token=${post.fcmToken}`)
        }

        fetchData();
    }

    const handleEditPost = () => {
        router.push('/community/edit/' + id);
    };

    const handleDeletePost = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        toast('게시글이 삭제되었습니다', { icon: '🗑️' })
        await deleteDoc(doc(firestore, 'board', id));
        router.replace('/community');
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setTimeout(() => {
            commentEditorInputRef.current.value = comment.content;
            commentEditorInputRef.current.focus();
        }, 100);
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await deleteDoc(doc(firestore, 'board', id, 'comments', commentId));
        toast('댓글이 삭제되었습니다', { icon: '🗑️' })
        fetchData();
    };

    const handleUpdateComment = async () => {
        const newContent = commentEditorInputRef.current.value;
        if (!newContent) {
            toast.error('댓글을 입력해주세요');
            return;
        }

        await updateDoc(doc(firestore, 'board', id, 'comments', editingCommentId), {
            content: newContent,
        });
        commentEditorInputRef.current.value = '';
        setEditingCommentId(null);
        fetchData();
    };

    async function cancelVote(index) {
        index = parseInt(index);
        const options = post.options;
        options[index].count -= 1;
        const participants = post.participants - 1;

        const boardRef = doc(firestore, 'board', id);

        await runTransaction(firestore, async (transaction) => {
            const boardSnapshot = await transaction.get(boardRef);
            const boardData = boardSnapshot.data();

            if (boardData) {
                // Ensure data consistency by updating based on current values
                const updatedOptions = [...boardData.options];
                updatedOptions[index].count -= 1;

                transaction.update(boardRef, {
                    options: updatedOptions,
                    participants: boardData.participants - 1,
                });
            }
        });

        await updateDoc(doc(firestore, 'users', currentUserId), {
            doneVotes: {
                ...post.doneVotes,
                [id]: null,
            },
        });
    }

    async function cancelAllVote(index) {
        index = parseInt(index);
        const options = post.options;
        options[index].count -= 1;

        const boardRef = doc(firestore, 'board', id);

        await runTransaction(firestore, async (transaction) => {
            const boardSnapshot = await transaction.get(boardRef);
            const boardData = boardSnapshot.data();

            if (boardData) {
                // Ensure data consistency by updating based on current values
                const updatedOptions = [...boardData.options];
                updatedOptions[index].count -= 1;

                transaction.update(boardRef, {
                    options: updatedOptions,
                });
            }
        });
    }

    const handleCandidateClick = async (index) => {
        index = parseInt(index);

        if (myVote == index) {
            await cancelVote(index);
            setMyVote(null);
            fetchData();
            return;
        }

        if (myVote !== null) {
            await cancelAllVote(myVote);
        }

        const options = post.options;
        options[index].count += 1;

        const boardRef = doc(firestore, 'board', id);

        await runTransaction(firestore, async (transaction) => {
            const boardSnapshot = await transaction.get(boardRef);
            const boardData = boardSnapshot.data();

            if (boardData) {
                // Ensure data consistency by updating based on current values
                const updatedOptions = [...boardData.options];
                updatedOptions[index].count += 1;

                transaction.update(boardRef, {
                    options: updatedOptions,
                    participants: boardData.participants + 1,
                });
            }
        });

        await updateDoc(doc(firestore, 'users', currentUserId), {
            doneVotes: {
                ...post.doneVotes,
                [id]: index,
            },
        });

        setMyVote(index);
        fetchData();
    };


    return (
        <>
            <HeadTag title={'커뮤니티 | ' + post.title} />
            <Toaster />

            <main>
                <header>
                    <IonIcon name="chevron-back" onClick={() => window.close()} style={{ fontSize: '25px', cursor: 'pointer' }} />
                    {currentUserId && post && currentUserId === post.userId && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'absolute', right: '20px', top: '10px' }}>
                            {!isVote && <button style={{ background: 'none', padding: '5px' }} onClick={() => handleEditPost()}>수정</button>}
                            <button style={{ background: 'none', padding: '5px' }} onClick={() => handleDeletePost()}>삭제</button>
                        </div>
                    )}
                </header>
                <Spacer y={50} />

                {post && <>
                    <div className="post-header">
                        <img src={`../icons/profileImg/letter${post.profileImg || 1}.png`} className="profile-img" />
                        <span id="uname">{(post.admin) ?
                            <span>{post.nickname}&nbsp;
                                <IonIcon name="checkmark-circle" style={{ position: 'relative', top: '2px', color: 'var(--button-text)' }} /></span>
                            : <span>{post.nickname}</span>}<br />
                            <span style={{ opacity: 0.7 }}>{post.createdAt && moment(post.createdAt.toDate()).format('YYYY-MM-DD')}</span>
                        </span>
                    </div>


                    {!post.title && <div style={{ width: 'calc(100% + 40px)' }}>
                        <Spacer y={10} />
                        <div className="skeleton-loader"></div>
                        <Spacer y={10} />
                        <div className="skeleton-loader"></div>
                    </div>
                    }


                    <div style={{ width: 'calc(100% + 40px)' }} className='post-content-wrap'>

                        <h3>{post.title}</h3>

                        {isVote ?
                            <div className='post-vote'>
                                {post && post.options && Object.entries(post.options).map((vote, index) => {
                                    const option = vote[1];
                                    const progressWidth = (option.count !== 0) ? Math.round((option.count / post.participants) * 100).toString() + '%' : '0%';

                                    return (
                                        <div className={`vote-choice-item ${myVote != null && myVote == index ? 'active' : ''}`} data-index={index}
                                            onClick={() => handleCandidateClick(index)}>
                                            <div className="inner">
                                                <h3>{option.title}</h3>
                                                <span>{(option.count !== 0) ? Math.round((option.count / post.participants) * 100) : 0}%</span>
                                            </div>
                                            <div className="vote-progress" style={{ width: progressWidth }}></div>
                                        </div>
                                    );
                                })}
                                <br />
                                <span style={{ opacity: .7 }}>투표에 {post.participants}명 참여</span>
                            </div>
                            : <ReactMarkdown remarkPlugins={[remarkGfm]}
                                components={{ img: ({ node, ...props }) => <img className="post-image" {...props} alt="" /> }}>
                                {post.content && post.content.replaceAll('<br>', '&nbsp; \n')}
                            </ReactMarkdown>}


                    </div>
                    <Spacer y={30} />
                    <hr style={{ width: 'calc(100% + 40px)', opacity: 0.1 }} />
                    <h3>댓글</h3>

                    {
                        editingCommentId ?
                            <>
                                <span className="badge">댓글 수정 중</span><Spacer y={10} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: 'calc(100% + 40px)' }}>
                                    <input style={{ width: '100%', borderRadius: '15px 0 0 15px' }} placeholder='수정할 댓글 내용을 입력하세요' ref={commentEditorInputRef}>
                                    </input>
                                    <button style={{ width: '80px', height: '50px', borderRadius: '0 15px 15px 0' }} onClick={() => handleUpdateComment()}>수정</button>
                                </div>
                            </>
                            :
                            currentUserId && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: 'calc(100% + 40px)' }}>
                                    <input style={{ width: '100%', borderRadius: '15px 0 0 15px' }} placeholder='댓글 내용을 입력하세요' ref={commentInputRef}>
                                    </input>
                                    <button style={{ width: '80px', height: '50px', borderRadius: '0 15px 15px 0' }} onClick={() => postComment()}>등록</button>
                                </div>
                            )
                    }

                    <Spacer y={20} />
                    {comments && comments.map((comment, index) => {
                        return (
                            <div key={index} className="post-item">
                                <div className="post-header">
                                    <img src={`../icons/profileImg/letter${comment.profileImg || 1}.png`} className="profile-img" />
                                    <span id="uname">{(comment.admin) ?
                                        <span>{comment.nickname}&nbsp;
                                            <IonIcon name="checkmark-circle" style={{ position: 'relative', top: '2px', color: 'var(--button-text)' }} /></span>
                                        : <span>{comment.nickname}</span>}<br />
                                        <span style={{ opacity: 0.7 }}>{comment.createdAt && moment(comment.createdAt.toDate()).format('YYYY-MM-DD')}</span>
                                    </span>
                                </div>
                                <p id="post-content">{comment.content}</p>
                                {currentUserId === comment.userId && (
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'flex-end', width: '100%' }}>
                                        <button style={{ background: 'none', padding: '5px' }} onClick={() => handleEditComment(comment)}>수정</button>
                                        <button style={{ background: 'none', padding: '5px' }} onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {(!comments || comments.length < 1) &&
                        <div style={{ textAlign: 'center', opacity: .5, width: "calc(100% + 40px)" }}>
                            <Spacer y={20} />
                            <IonIcon style={{ fontSize: '50px' }} name={'chatbubble-ellipses-outline'} />
                            <Spacer y={10} />
                            <span>아직 댓글이 없어요</span>
                        </div>
                    }

                </>
                }
                <Spacer y={70} />


            </main >

            <style jsx>{`
            header {
                position: fixed;
                right: 0;
                top: 0;
                z-index: 99;
                display: flex;
                padding: 20px;
                backdrop-filter: blur(15px) saturate(200%);
                -webkit-backdrop-filter: blur(15px) saturate(200%);
                background-color: var(--background-blur);
                width: calc(100% - 40px);
            }

            
.post-image {
    width: 100%;
    border-radius: 15px;
    object-fit: cover;
}
            
            @media screen and (min-width: 768px) {
                header {
                    width: 75%;
                }

                .post-image {
                    width: 40%;
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
    border-radius: 10px 20px 20px 20px;
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
    opacity: .8;
    margin-top: -10px;
}

.post-preview {
    border-radius: 10px;
    opacity: 0.8;
}


.post-vote .vote-choice-item {
    padding: 0 20px 10px;
    border-radius: 20px;
    border: 1px solid var(--button-bg);
    cursor: pointer;
    margin-bottom: 10px;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    -webkit-transition: .5s;
    -moz-transition: .5s;
    -o-transition: .5s;
    transition: .5s
}

.post-vote .vote-choice-item:active {
    transform: scale(.98)
}

.post-vote .vote-choice-item .inner {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: -10px
}

.post-vote .vote-choice-item .inner h3 {
    word-break: break-all;
    margin-right: 10px
}

.post-vote .vote-choice-item.active {
    background-color: var(--button-bg);
    border: none
}

.post-vote .vote-choice-item .vote-progress {
    width: 0;
    height: 5px;
    margin: 0 0 10px;
    padding: 0;
    background-color: #527dff;
    border-radius: 10px;
    transition: width .5s ease-in-out
}

.post-vote #participants-count {
    position: relative;
    top: 10px
}
            `}
            </style>
        </>
    )
}