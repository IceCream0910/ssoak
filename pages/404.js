import Head from "next/head";
import { useRouter } from "next/router";
import HeadTag from "../components/common/headTag";

export default function Error() {
    const route = useRouter();

    return (
        <>
            <HeadTag title={"페이지를 찾을 수 없습니다"} />
            <main>
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
                        height: 100%;
                        flex-direction: column;
                        justify-content: center;
                        line-height: 0.5;
                        align-items: center;
                        height: 100%;
                        overflow:hidden;
                    }

                    
                    @media screen and (max-width: 768px) {
                        main {
                            padding: 0 20px;
                        }
                    }   
                `}
            </style>
        </>
    )
}
