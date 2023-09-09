import { SessionProvider } from "next-auth/react";
import '../styles/globals.css'
import ScrollToTop from "../components/scrollToTop";
import React, { useEffect, useState } from "react";
import router from "next/router";
import Image from "next/image";


export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startLoading = () => setLoading(true);
    const stopLoading = () => setLoading(false);

    // Register event listeners to show/hide the loading component
    // addEventListener : documen의 특정 요소 (id, class, tag ... ) event(클릭하면 함수를 실행하라.)
    window.addEventListener("beforeunload", startLoading);
    router.events.on("routeChangeStart", startLoading);
    router.events.on("routeChangeComplete", stopLoading);
    router.events.on("routeChangeError", stopLoading);

    // Unregister event listeners during cleanup
    // window.removeEventListener 이벤트 제거할 경우
    return () => {
      window.removeEventListener("beforeunload", startLoading);
      router.events.off("routeChangeStart", startLoading);
      router.events.off("routeChangeComplete", stopLoading);
      router.events.off("routeChangeError", stopLoading);
    };
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      {loading && (
        <div className="loading-full">
          <Image src='/loader.gif' width={50} height={50} alt="splash-icon"></Image>
        </div>
      )}
      <Component {...pageProps} />
      <ScrollToTop />
    </SessionProvider>
  )
}
