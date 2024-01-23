import Head from "next/head";

function HeadTag({ title }) {
    return (
        <Head>
            <title>쏙 - {title} | 성일고의 모든 정보, 한 눈에 쏙</title>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0" />
            <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
            <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
            <link rel="shortcut icon" href="/icons/icon-192x192.png" />
            <link rel="icon" href="/icons/icon-192x192.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="white" />
            <meta name="apple-mobile-web-app-title" content="쏙" />
            <meta name="description" content="성일고의 모든 정보, 한 눈에 쏙" />
            <meta name="naver-site-verification" content="fa35f8ef36dddfd6a7d8ca7db25136469aadf0c8" />
            <meta name="theme-color" content="#5264AE" />
            <meta property="og:url" content="https://sungil.me" />
            <meta property="og:title" content="쏙" />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="https://i.imgur.com/frj9qPN.png" />
            <meta property="og:description" content="성일고의 모든 정보, 한 눈에 쏙"></meta>
        </Head>
    );
}

export default HeadTag;
