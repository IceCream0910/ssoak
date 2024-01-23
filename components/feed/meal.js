import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IonIcon from '@reacticons/ionicons';
import Image from 'next/image';
import { firestore } from "../../firebase/firebase"
import { collection, addDoc, doc, getDoc, updateDoc, update } from "@firebase/firestore";
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css'
import { getMealData, getMonthMealData, getMenuImage } from '../../utils/meal';
import Spacer from '../common/spacer';

function Meal({ date, title }) {
    const [monthData, setMonthData] = useState(null);
    const [data, setData] = useState(null);
    const [reactionData, setReactionData] = useState(null);
    const [like, setLike] = useState(0);
    const [dislike, setDislike] = useState(0);

    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);

    const [selectedMenuName, setSelectedMenuName] = useState('');
    const [selectedMenuAllergy, setSelectedMenuAllergy] = useState('');

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!date) return;
        async function fetchData() {
            setData(await getMealData(date));
            setMonthData(await getMonthMealData(date));
            getReaction();
            setIsLoading(false);
        }
        fetchData();
        setIsLoading(true);
    }, [date]);

    async function getReaction() {
        const query = await getDoc(doc(firestore, 'meal', date));
        const data = query.data();
        if (!data) return;
        setLike(data.like);
        setDislike(data.dislike);
    }

    async function addLikeCnt() {
        // meal/{date} document가 {like: 0, dislike: 0}으로 생성하고, 존재하면 like를 1 증가시킴
        setLike(like + 1);
        const mealRef = doc(firestore, 'meal', date);
        const mealDoc = await getDoc(mealRef);
        if (!mealDoc.exists()) {
            await addDoc(collection(firestore, 'meal'), {
                like: 1,
                dislike: 0
            });
        } else {
            await updateDoc(doc(firestore, 'meal', date), {
                like: mealDoc.data().like + 1
            });
        }
    }

    async function addDislikeCnt() {
        // meal/{date} document가 {like: 0, dislike: 0}으로 생성하고, 존재하면 dislike를 1 증가시킴
        setDislike(dislike + 1);
        const mealRef = doc(firestore, 'meal', date);
        const mealDoc = await getDoc(mealRef);
        if (!mealDoc.exists()) {
            await addDoc(collection(firestore, 'meal'), {
                like: 0,
                dislike: 1
            });
        } else {
            await updateDoc(doc(firestore, 'meal', date), {
                dislike: mealDoc.data().dislike + 1
            });
        }
    }


    const openMonthModal = () => {
        setIsMonthModalOpen(true);
        if (document.getElementById('monthMeal-' + date.substring(6, 8).replace(/(^0+)/, "")))
            document.getElementById('monthMeal-container').scrollTop = document.getElementById('monthMeal-' + date.substring(6, 8).replace(/(^0+)/, "")).offsetTop - document.getElementById('monthMeal-container').offsetTop - 10;
    }

    const openMenuModal = (meal) => {
        setSelectedMenuName(meal.name);
        setSelectedMenuAllergy(meal.allergy.replace('10', '돼지고기').replace('11', '복숭아').replace('12', '토마토').replace('13', '아황산염').replace('14', '호두').replace('15', '닭고기').replace('16', '쇠고기').replace('17', '오징어').replace('18', '조개류(굴, 전복, 홍합 포함)').replace('19', '잣').replaceAll('.', ', ').replace('1', '난류').replace('2', '우유').replace('3', '메밀').replace('4', '땅콩').replace('5', '대두').replace('6', '밀').replace('7', '고등어').replace('8', '게').replace('9', '새우'));
        setIsMenuModalOpen(true);
    }

    return (
        <div>
            <div className="card">
                <div className="card-title" onClick={() => openMonthModal()}>
                    {title} <IonIcon name="chevron-forward-outline" style={{ position: "relative", top: "2px" }} />
                    <br />
                </div>

                {isLoading && (<>
                    <Spacer y={20} />
                    <div className="skeleton-loader"></div>
                </>
                )}

                <p style={{ fontSize: '14px' }}>
                    {data && data.map((meal, index) => {
                        return (
                            <span key={index} onClick={() => openMenuModal(meal)}
                                style={{ color: meal.isDanger ? '#ff4e4e' : 'inherit' }}>{meal.name}{meal.isFavorite && '✨'}{index != data.length - 1 && ', '}</span>
                        )
                    })}

                    {(!data || (data && data.length < 1)) && <span style={{ opacity: .7 }}>등록된 급식 정보가 없어요</span>}
                </p>

            </div>

            <div className="reaction-wrap">
                {data && <>
                    <div className="reaction" onClick={() => addLikeCnt()}>
                        <div className="reaction__icon">
                            <IonIcon name="happy" style={{ color: "#5c90ff", position: "relative", top: "2px", fontSize: '20px' }}></IonIcon>
                        </div>
                        <div className="reaction__count" id="meal-like-count">{like}</div>
                    </div>
                    <span style={{ opacity: .2 }}>|</span>
                    <div className="reaction" onClick={() => addDislikeCnt()}>
                        <div className="reaction__icon">
                            <IonIcon name="sad" style={{ color: "#ff7373", position: "relative", top: "2px", fontSize: '20px' }}></IonIcon>
                        </div>
                        <div className="reaction__count" id="meal-dislike-count">{dislike}</div>
                    </div>
                </>}
                {!data && <Spacer y={20} />}
            </div>

            <BottomSheet open={isMonthModalOpen} expandOnContentDrag={false} scrollLocking={true} onDismiss={() => setIsMonthModalOpen(false)}>
                <div className="bottom-sheet">
                    <h2>이번 달 급식</h2>
                    <div id="monthMeal-container" style={{ maxHeight: '50dvh', overflowY: 'auto', margin: '20px 0' }}>
                        {monthData && Object.entries(monthData).map(([key, value]) => (
                            <div key={key} id={'monthMeal-' + key}>
                                <h3>{key}일</h3>
                                <p dangerouslySetInnerHTML={{ __html: value }}></p>
                                <hr style={{ opacity: .1 }}></hr>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setIsMonthModalOpen(false)}>닫기</button>
                </div>
            </BottomSheet>


            <BottomSheet open={isMenuModalOpen} expandOnContentDrag={true} scrollLocking={true} onDismiss={() => setIsMenuModalOpen(false)}>
                <div className="bottom-sheet">
                    <h3>{selectedMenuName}</h3>
                    <span>{selectedMenuAllergy}</span>
                    <Spacer y={20} />
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px' }}>
                        <button onClick={() => window.open('https://www.google.com/search?tbm=isch&q=' + selectedMenuName)} style={{ width: '50%' }}>
                            <IonIcon name='search-outline' />&nbsp;&nbsp;웹에서 검색</button>
                        <button onClick={() => setIsMenuModalOpen(false)} style={{ width: '50%' }}>닫기</button>
                    </div>
                </div>
            </BottomSheet>

            <style jsx>{`
            .card {
                display: flex;
                flex-direction: column;
                background-color: var(--secondary-bg);
                font-weight: 400;
                overflow: hidden;
                width: 100%;
                z-index: 1;
                border-radius: 20px;
                padding: 15px 20px;
                padding-bottom: 40px;
                margin-bottom: -20px;
            }

            .card-title {
                opacity: 0.6;
                font-size: 14px;
            }

            .reaction-wrap {
                display: flex;
                border-radius: 20px!important;
                flex-direction: row;
                align-items: center;
                margin-bottom: 10px;
                padding: 10px 10px;
                gap: 10px;
                width: fit-content;
                position: relative;
                float: right;
                right: -30px;
                bottom: 30px;
                z-index: 1;
                font-size: 16px;
            }

            .reaction-wrap .reaction {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                gap: 5px;
            }
    
            `}</style>
        </div >
    );
}

export default Meal;
