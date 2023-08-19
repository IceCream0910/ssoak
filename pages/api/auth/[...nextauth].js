import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

export const authOptions = {
    providers: [
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, token, user }) {
            session.user.id = token.sub;
            return session;
        },
    },
};
export default NextAuth(authOptions);