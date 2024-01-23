"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import HeadTag from '../../components/common/headTag'
import Spacer from '../../components/common/spacer';
import moment from 'moment';
import Image from 'next/image';
import { firestore } from "../../firebase/firebase"
import IonIcon from '@reacticons/ionicons';
import { getAllergyLabel } from '../../utils/meal';

export default function Community() {
    const router = useRouter();
    const [grade, setGrade] = useState(1);
    const [classNum, setClassNum] = useState(1);
    const [allergy, setAllergy] = useState([]);

    useEffect(() => {
        const savedGrade = localStorage.getItem('sungil_grade');
        const savedClassNum = localStorage.getItem('sungil_classNum');
        const savedAllergy = localStorage.getItem('sungil_alleList');

        if (savedGrade && savedClassNum) {
            setGrade(savedGrade);
            setClassNum(savedClassNum);
        }

        if (savedAllergy) {
            const savedAllergyArray = savedAllergy.split(',').map(num => parseInt(num, 10));
            setAllergy(savedAllergyArray);
        }



    }, []);

    useEffect(() => {
        localStorage.setItem('sungil_grade', grade);
        localStorage.setItem('sungil_classNum', classNum);
    }, [grade, classNum]);

    useEffect(() => {
        console.log(allergy)
        if (!allergy) return;
        localStorage.setItem('sungil_alleList', allergy.join(','));
    }, [allergy]);


    const handleCheckboxChange = (num) => {
        const numString = parseInt(num, 10);

        const index = allergy.indexOf(numString);

        if (index === -1) {
            setAllergy([...allergy, numString]);
        } else {
            const updatedAllergy = [...allergy];
            updatedAllergy.splice(index, 1);
            setAllergy(updatedAllergy);
        }
    };


    return (
        <>
            <HeadTag title={'설정'} />
            <Toaster />

            <main>
                <header>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <h2 style={{ marginLeft: '5px' }}>&nbsp;설정</h2>
                    </div>

                </header>
                <Spacer y={70} />

                <h2>성일고 <span style={{ color: 'var(--active-color)' }}>
                    <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                    </select> 학년&nbsp;&nbsp;&nbsp;

                    <select value={classNum} onChange={(e) => setClassNum(e.target.value)}>
                        {Array.from({ length: 12 }, (_, index) => (
                            <option key={index + 1} value={index + 1}>{index + 1}</option>
                        ))}
                    </select> 반
                </span>
                </h2>

                <hr style={{ opacity: .1 }} />
                <Spacer y={10} />
                <h3 style={{ opacity: .9, margin: 0 }}>알레르기 정보 등록</h3>
                <Spacer y={5} />
                <span style={{ fontSize: '13px', opacity: .5 }}>알레르기가 있는 성분을 선택해두면 급식 메뉴에 빨간색으로 표시해줄게요.</span>
                <Spacer y={20} />
                <div>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((num) => (
                        <div
                            key={num}
                            className={`checkbox ${allergy.includes(num) ? 'active' : ''}`}
                            data-num={num}
                            onClick={() => handleCheckboxChange(num)}
                        >
                            {allergy.includes(num) && <IonIcon style={{ position: 'relative', top: '2px' }} name="checkmark" />}
                            {getAllergyLabel(num)}
                        </div>
                    ))}
                </div>

                <hr style={{ opacity: .1 }} />
                <Spacer y={20} />
                <h3 style={{ opacity: .9, margin: 0 }}>정보</h3>
                <Spacer y={10} />

                <button style={{ background: 'none', padding: 0, color: 'var(--text)' }}
                    onClick={() => window.open("https://status.sungil.me/", '_blank')}><IonIcon name="server-outline" />&nbsp;&nbsp;서비스 상태 확인</button>
                <Spacer />
                <button style={{ background: 'none', padding: 0, color: 'var(--text)' }}
                    onClick={() => window.open("https://github.com/IceCream0910/ssoak", '_blank')}><IonIcon name="logo-github" />&nbsp;&nbsp;프로젝트 소스코드</button>
                <Spacer />

                <button style={{ background: 'none', padding: 0, color: 'var(--text)' }}
                    onClick={() => router.push("/settings/license")}><IonIcon name="code-slash-outline" />&nbsp;&nbsp;오픈소스 라이선스</button>
                <Spacer />

                <button style={{ background: 'none', padding: 0, color: 'var(--text)' }}
                    onClick={() => router.push("/settings/privacy")}><IonIcon name="lock-closed-outline" />&nbsp;&nbsp;개인정보 처리방침</button>

                <Spacer y={50} />


                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center', opacity: .5 }}>
                    <span style={{ fontSize: '15px' }}>©{moment().format('YYYY')} <a href='https://yuntae.in' target='_blank'>Yun Tae In</a>
                        &nbsp;&nbsp;|&nbsp;</span>

                    <span><a href='https://sungil-h.goesn.kr/' target='_blank'>성일고등학교</a></span>
                    <img src="/icons/sungil_logo.svg" style={{ width: '30px' }}></img>



                </div>

                <Spacer y={140} />
            </main >

            <style jsx>{`
            @media screen and (max-width: 768px) {
                main {
                    width: calc(100% + 40px);
                }
            }

            .checkbox {
                display: inline-block;
                background-color: var(--secondary-bg);
                border: 1px solid var(--button-bg);
                border-radius: 20px;
                margin: 0 5px 10px 0;
                padding: 10px;
                color: var(--text);
                -webkit-animation-timing-function: linear;
                animation-timing-function: linear;
                -webkit-transition: .5s;
                -moz-transition: .5s;
                -o-transition: .5s;
                transition: .5s
            }

            .checkbox.active {
                background-color: var(--active-color);
                color: #fff;
            }

            .checkbox:active {
                transform: scale(0.96);
            }

            select {
                width: fit-content;
                border: none;
                color: var(--text);
                font-size: 1.5rem;
                padding: 5px 10px;
                outline: none;
            }

            header {
                position: fixed;
                right: 0;
                top: 0;
                z-index: 99;
                display: flex;
                padding: 20px;
                padding-bottom: 0;
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
            `}
            </style>
        </>
    )
}