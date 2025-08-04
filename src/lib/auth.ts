import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login as bffLogin } from "@/bff/services";
import { error as logError } from "@/lib/logger";

// Augment NextAuth types for v4
// These declarations should ideally be in a *.d.ts file (e.g., next-auth.d.ts)
// For simplicity here, keeping them in this file.
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    role?: string;
    user: {
      id?: string | number;
      role?: string;
    } & NextAuthUser;
  }

  interface User extends NextAuthUser {
    id: string | number;
    accessToken?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | number;
    accessToken?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "DummyJSON",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "kminchelle" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          logError('Auth: Missing username or password in credentials');
          return null;
        }

        try {
          const userFromBff = await bffLogin({
            username: credentials.username,
            password: credentials.password
          });

          if (userFromBff && userFromBff.accessToken) {
            console.log('Auth: User authorized by BFF:', userFromBff);
            return {
              id: String(userFromBff.id),
              name: [userFromBff.firstName, userFromBff.lastName].filter(Boolean).join(' ') || userFromBff.username,
              email: userFromBff.email,
              image: userFromBff.image,
              accessToken: userFromBff.accessToken,
              username: userFromBff.username,
              firstName: userFromBff.firstName,
              lastName: userFromBff.lastName,
              gender: userFromBff.gender,
            };
          } else {
            logError('Auth: BFF login failed or did not return accessToken', { userFromBff });
            return null;
          }
        } catch (error) {
          logError('Auth: Error in authorize callback:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.role = 'b2b';
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token?.id && session.user) {
        session.user.id = token.id as string | number;
      }
      if (token?.role) {
        session.role = token.role as string;
        if (session.user) {
          session.user.role = token.role as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV !== 'production',
};
