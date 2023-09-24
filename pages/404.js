import Head from "next/head";
import styles from '../styles/Home.module.css'
import { useRouter } from "next/router";

export default function Error() {
    const route = useRouter();

    return (
        <>
            <Head>
                <title>유니터뷰 - 학생 관리</title>
                <meta name="description" content="생기부 기반 면접 대비, AI와 함께해보세요." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main}`}>
                <h1>404</h1>
                <h3>페이지를 찾을 수 없습니다.</h3>
                <button onClick={() => route.replace('/')}>메인으로 이동</button>
            </main>
            <style jsx>
                {`
                    html, body {
                        height: 100dvh;
                        overflow:hidden;
                    }

                    main {
                        display:flex;
                        flex-direction: column;
                        justify-content: center;
                        line-height: 0.5;
                        align-items: center;
                        height: 100%;
                        overflow:hidden;
                    }
                `}
            </style>
        </>
    )
}
