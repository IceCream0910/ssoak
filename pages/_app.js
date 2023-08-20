import { SessionProvider } from "next-auth/react";
import '@/styles/globals.css'
import ScrollToTop from "@/components/scrollToTop";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
      <ScrollToTop />
    </SessionProvider>
  )
}
