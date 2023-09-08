import Head from "next/head";
import styles from '@/styles/Home.module.css'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/router";
import toast, { Toaster } from 'react-hot-toast';
import IonIcon from '@reacticons/ionicons'
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

export default function Ocr() {
    const router = useRouter();
    const cropperRef = useRef(null);
    // 유저가 첨부한 이미지
    const [inputImage, setInputImage] = useState(null);
    // 유저가 선택한 영역만큼 크롭된 이미지
    const [croppedImage, setCroppedImage] = useState(null);

    const [isCropped, setIsCropped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [resultText, setResultText] = useState('')


    const onCrop = () => {
        const imageElement = cropperRef?.current;
        const cropper = imageElement?.cropper;
        const croppedCanvas = cropper.getCroppedCanvas();
        croppedCanvas.toBlob(async (blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append('file', blob);
            formData.append("UPLOADCARE_PUB_KEY", "75eed8f5579c1ec7fa9a");

            try {
                const response = await fetch("https://upload.uploadcare.com/base/", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                const imageUrl = "https://ucarecdn.com/" + data.file + "/";
                const ocrResponse = await fetch(
                    `https://gpt-chat-api.onrender.com/vision/ocr?img=${imageUrl}`
                )
                    .then((response) => response.json())
                    .then((data) => data)
                    .catch((error) => {
                        console.error(error);
                    });
                setIsLoading(false);
                if (ocrResponse.length != 0) {
                    setResultText(ocrResponse[0].description)
                } else {
                    toast.error('텍스트를 인식하지 못했어요.')
                }
            } catch (error) {
                console.error(error);
            }
        });
    };

    function copyText() {
        navigator.clipboard.writeText(resultText).then(function () {
            toast.success('클립보드에 복사했어요');
        }, function (err) {
            console.error('Could not copy text: ', err);
        });
    }

    return (
        <>
            <Toaster />
            <Head>
                <title>유니터뷰 - 사진에서 글자 추출</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main}`}>
                <header>
                    <div className="header-left">
                        <IonIcon name='chevron-back-outline' onClick={() => window.close()} /><h3 className="header-title">사진에서 글자 추출</h3>
                    </div>
                    <div className="header-right">
                    </div>
                </header>
                <br></br><br></br><br></br>

                {!inputImage && <div className="sanggibu-card" style={{ padding: "15px 20px", textAlign: 'center', }}>
                    <Image src='/Camera-rafiki.svg' width={0} height={0} sizes="100vw" className="big-image" alt="upload"></Image><br></br>

                    아직 반영되지 않은 생기부를 종이로 가지고 있다면 사진을 찍어서 입력하세요.
                    <br></br><br></br>
                    <input type="file" id="file" accept="image/*" onChange={(e) => setInputImage(URL.createObjectURL(e.target.files[0]))} />
                    <label for="file"><IonIcon name="camera" />&nbsp;&nbsp;사진 업로드</label>
                    <br></br><br></br>
                </div>}

                {(inputImage && !isCropped) &&
                    <>
                        <h3>이미지에서 한 항목만<br></br>나오도록 잘라주세요</h3>
                        <Cropper src={inputImage} ref={cropperRef}
                            style={{ height: '65dvh' }}
                            zoomTo={0.2}
                            initialAspectRatio={1}
                            viewMode={1}
                            background={false}
                            responsive={true}
                            autoCropArea={1}
                            checkOrientation={true}
                            guides={true} />
                        <button
                            style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', width: 'auto', height: '50px', boxSizing: 'border-box' }}
                            onClick={() => [onCrop(), setIsCropped(true)]}
                        >완료</button>
                    </>
                }

                {(inputImage && isCropped) &&
                    <>
                        <h3>{isLoading ? '텍스트를 인식하고 있어요.' : '텍스트를 인식했어요!'}</h3>
                        {isLoading && <div>
                            <div className="loading-circle">
                                <div className="spinner"></div>
                            </div>
                        </div>}
                        <img src={croppedImage} style={{ width: '100%', borderRadius: '10px' }}></img>
                        <br></br>

                        <h4>인식한 텍스트 : </h4>
                        <p>{resultText}</p>

                        <button
                            style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', width: 'auto', height: '50px', boxSizing: 'border-box' }}
                            onClick={() => copyText()}
                        >텍스트 복사하기</button>
                    </>
                }






            </main >
        </>
    )
}