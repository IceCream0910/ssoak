import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import IonIcon from '@reacticons/ionicons';

export function HorizontalScrolling({ universitiesData }) {
    const containerRef = useRef(null);
    const router = useRouter();
    const [displayedQuestions, setDisplayedQuestions] = useState([]);
    const [animate, setAnimate] = useState(false); // 애니메이션 클래스 추가/제거 상태
    const itemDisplayInterval = 5000;
    const questionsPerDisplay = 3;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateDisplayedQuestions = () => {
            let allQuestions = universitiesData.reduce((questions, data) => {
                return questions.concat(data.questions);
            }, []);

            // 중복 질문 제거
            allQuestions = [...new Set(allQuestions)];

            // 전체 질문이 3개 미만일 경우 대응
            if (allQuestions.length < questionsPerDisplay) {
                setDisplayedQuestions(allQuestions);
            } else {
                const selectedQuestions = [];
                while (selectedQuestions.length < questionsPerDisplay) {
                    const randomIndex = Math.floor(Math.random() * allQuestions.length);
                    const selectedQuestion = allQuestions[randomIndex];
                    if (!selectedQuestions.includes(selectedQuestion)) {
                        selectedQuestions.push(selectedQuestion);
                    }
                }

                setDisplayedQuestions(selectedQuestions);
            }

            setAnimate(true); // 애니메이션 활성화
            setTimeout(() => setAnimate(false), 1000); // 1초 후 애니메이션 비활성화
        };

        // Initialize displayed questions
        updateDisplayedQuestions();
        const questionDisplayTimer = setInterval(updateDisplayedQuestions, itemDisplayInterval);

        return () => {
            clearInterval(questionDisplayTimer);
        };
    }, [universitiesData]);

    return (
        <>
            <h3>대학별 예상 질문 답변 작성하러 가기<IonIcon name='chevron-forward' style={{ position: 'relative', top: '4px' }} /></h3>
            <div
                ref={containerRef}
                style={{ marginTop: '-10px', boxSizing: 'border-box', position: 'relative' }}
                onClick={() => router.push('/univs')}
            >
                <div style={{ lineHeight: 2.5, width: 'fit-content', position: 'absolute' }}>
                    {displayedQuestions.map((questionObj, key) => (
                        <span
                            key={key}
                            className={`badge ${animate ? 'animate-badge' : ''}`} // 애니메이션 클래스 동적 추가/제거
                            style={{ padding: '10px 15px', marginRight: '10px', whiteSpace: 'nowrap', overflow: 'hidden' }}
                        >
                            Q. {questionObj.question}
                        </span>
                    ))}
                </div>
            </div>
            <br></br><br></br>
        </>
    );
}
