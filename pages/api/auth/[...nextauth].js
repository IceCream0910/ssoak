import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";


export const authOptions = {
    providers: [
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
        }),
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, token, user }) {
            session.user.id = token.sub.replaceAll('-', '');
            if (!session.user.name) {
                session.user.name = session.user.email.split('@')[0];
            }
            return session;
        },
    },
};
export default NextAuth(authOptions);