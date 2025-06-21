// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login as bffLogin } from '@/bff/services'; // Your BFF login service
import { AuthResponseSchema } from '@/bff/types'; // Removed UserSchema as it's unused
import { z } from 'zod';
import { error as logError } from "@/lib/logger";

// Augment NextAuth types to include 'role' and 'id' on user and session
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string | number; // Or just number if your ID is always number
      role?: string;
      rememberMe?: boolean; // Add this
      accessToken?: string;
      // refreshToken?: string; // Removed
    } & NextAuthUser; // Keep existing fields like name, email, image
  }
  interface User extends NextAuthUser {
    id?: string | number;
    role?: string;
    rememberMe?: boolean; // Add this
    accessToken?: string;
    // refreshToken?: string; // Removed
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string | number;
    role?: string;
    rememberMe?: boolean; // Add this
    accessToken?: string;
    // refreshToken?: string; // Removed
    username?: string;
    // picture?: string | null; // if using image from profile
  }
}

const credentialsProvider = () =>
  CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          if (process.env.NODE_ENV !== 'production') {
            logError('Auth: Missing username or password in credentials');
          }
          return null;
        }
        try {
          const json = AuthResponseSchema.parse(
            await bffLogin({ username: credentials.username, password: credentials.password })
          );

          const user: User = {
            id: String(json.id),
            name: [json.firstName, json.lastName].filter(Boolean).join(' ') || json.username,
            email: json.email,
            image: json.image,
            accessToken: json.token, // Changed from json.accessToken
            // refreshToken: json.refreshToken, // Removed as DummyJSON provides a single token
          };

          if (process.env.NODE_ENV !== 'production') {
            console.log('Auth: User authorized:', user);
          }
          return user;

        } catch (error: unknown) { // Changed error type to unknown
          if (process.env.NODE_ENV !== 'production') {
            if (error instanceof z.ZodError) {
              logError('Auth: Zod validation error in authorize callback:', error.errors);
            } else if (error instanceof Error) { // Check if error is an instance of Error
              logError('Auth: Error in authorize callback:', error.message);
            } else {
              logError('Auth: Unknown error in authorize callback:', error);
            }
          }
          // Regardless of error type, return null for auth failure
          // Return null if authentication fails
          return null;
        }
      }
    });

export const authOptions: NextAuthOptions = {
  providers: [credentialsProvider],
  session: {
    strategy: "jwt", // Using JWT for session strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days (default longer duration)
  },
  callbacks: {
    async jwt({ token, user }) { // Removed _account, _profile
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.accessToken = user.accessToken; // This now holds the single token from DummyJSON
        // token.refreshToken = user.refreshToken; // Removed
      }
      return token;
    },
    async session({ session, token }) { // Removed _user
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.name = token.name ?? session.user.name;
        session.user.accessToken = token.accessToken as string | undefined; // Token is passed here
        // session.user.refreshToken = token.refreshToken as string | undefined; // Removed
      }
      // session.user.image = token.picture ?? session.user.image;
      if (process.env.NODE_ENV !== 'production') {
        console.log('Auth: Session created/updated:', session);
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Redirect users to /login page for sign-in
    error: '/auth/error', // Custom error page
    // signOut: '/auth/signout' // (optional)
  },
  // secret: process.env.NEXTAUTH_SECRET, // Essential for production! Add to .env.local
  debug: true,
};

if (process.env.NODE_ENV !== "production") {
  console.log("Auth options types", {
    provider: typeof authOptions.providers[0],
    authorize: typeof credentialsProvider().authorize,
    jwt: typeof authOptions.callbacks?.jwt,
    session: typeof authOptions.callbacks?.session,
  });
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
