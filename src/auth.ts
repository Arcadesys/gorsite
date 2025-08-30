// Central NextAuth exports using the recommended helpers pattern
// See: https://next-auth.js.org/configuration/nextjs#route-handlers-app
// and Next.js 15 async dynamic APIs guidance
// @ts-nocheck
import NextAuth from "next-auth";
import { authOptions } from "@/app/api/auth/auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
