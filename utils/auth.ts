/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { fetcher } from "./fetcher";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const responseData = await fetcher(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local?populate=*`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          }
        );
        console.log("responseData------", responseData);
        return {
          id: responseData.user.id,
          data: responseData,
          email: responseData.user.email,
          name: responseData.user.username,
          randomKey: "Hey cool",
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          data: token.data,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: async ({ token, user, account, trigger, session }) => {
      if (trigger == "update") {
        return { ...token, ...session.user };
      }

      if (user && account?.provider == "credentials") {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          data: u.data,
          randomKey: u.randomKey,
        };
      }
      return Promise.resolve(token);
    },
  },
};