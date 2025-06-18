// src/app/api/auth/[...nextauth]/route.ts

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV !== 'production') {
  console.warn(
    `[33mwarn[0m  - NEXTAUTH_URL environment variable is not set. ` +
    `This can lead to issues, especially in production and build environments. ` +
    `Please ensure it is set (e.g., http://localhost:3000 for local development).`
  );
}

// Also check for AUTH_URL as mentioned by the user, in case it's used by a specific helper
if (!process.env.AUTH_URL && process.env.NODE_ENV !== 'production' && !process.env.NEXTAUTH_URL) {
    // Only warn about AUTH_URL if NEXTAUTH_URL is also not set, as NEXTAUTH_URL is the primary one.
  console.warn(
    `[33mwarn[0m  - AUTH_URL environment variable is not set. ` +
    `Consider setting this if NEXTAUTH_URL is not resolving all URL construction issues, ` +
    `though NEXTAUTH_URL is the primary variable for NextAuth v5.`
  );
}

// After imports
// Log environment variables for debugging, especially during startup/initialization
console.log("[NextAuth Env Check]", {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not Set",
  NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
  NODE_ENV: process.env.NODE_ENV || "Not Set",
  VERCEL_URL: process.env.VERCEL_URL || "Not Set", // Useful for Vercel context
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "Not Set" // From previous discussions
});

import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login as bffLogin } from '@/bff/services'; // Your BFF login service
import { AuthResponseSchema } from '@/bff/types'; // Removed UserSchema as it's unused
import { z } from 'zod';

// Augment NextAuth types to include 'role' and 'id' on user and session
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string | number; // Or just number if your ID is always number
      role?: string;
      rememberMe?: boolean; // Add this
    } & NextAuthUser; // Keep existing fields like name, email, image
  }
  interface User extends NextAuthUser {
    id?: string | number;
    role?: string;
    rememberMe?: boolean; // Add this
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string | number;
    role?: string;
    rememberMe?: boolean; // Add this
    // picture?: string | null; // if using image from profile
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "checkbox" } // Add this
      },
      async authorize(credentials, req) { // Added req for completeness, though credentials is primary here
        // console.log("[authorize] Raw request (if needed):", req); // Example if full req needed
        console.log("[authorize] Inbound credentials:", credentials ? JSON.stringify(credentials) : "undefined");

        if (!credentials?.username || !credentials?.password) {
          console.warn('[authorize] Missing username or password in credentials');
          return null;
        }

        try {
          // Call your BFF login service (already in existing code)
          const loginData = await bffLogin({
            username: credentials.username,
            password: credentials.password
          });

          if (!loginData) {
            console.warn("[authorize] BFF login service returned no data (loginData is null or undefined). Username: ", credentials.username);
            return null; // Explicitly return null if loginData is null/undefined
          }
          console.log("[authorize] Data received from bffLogin:", JSON.stringify(loginData));

          // Validate response with Zod (already in existing code)
          const parsedLoginResponse = AuthResponseSchema.parse(loginData);
          console.log("[authorize] Parsed login response from Zod:", JSON.stringify(parsedLoginResponse));

          // Determine role (already in existing code)
          let userRole = "customer";
          if (parsedLoginResponse.username === "kminchelle") {
            userRole = "b2b";
          }
          console.log("[authorize] Determined user role:", userRole);

          // Construct the user object for NextAuth (already in existing code)
          const userForNextAuth: User = { // Use the augmented User type
            id: String(parsedLoginResponse.id), // Ensure ID is string
            name: parsedLoginResponse.username,
            email: parsedLoginResponse.email,
            image: parsedLoginResponse.image,
            role: userRole,
            // rememberMe: credentials.rememberMe === 'true' || credentials.rememberMe === true, // rememberMe is part of credentials, not usually part of the user object model itself unless specifically needed elsewhere
          };
          // Add rememberMe to the user object if it's part of your augmented User type and you need it in the JWT/session
          if (credentials.rememberMe) {
              (userForNextAuth as any).rememberMe = credentials.rememberMe === 'true' || credentials.rememberMe === true;
          }


          console.log("[authorize] Successfully constructed user object for NextAuth:", JSON.stringify(userForNextAuth));
          return userForNextAuth;

        } catch (error) {
          console.error("[authorize] Error during authorization flow. Username: ", credentials.username);
          if (error instanceof z.ZodError) {
            console.error("[authorize] Zod validation error:", JSON.stringify(error.errors));
          } else if (error instanceof Error) {
            console.error("[authorize] Caught error message:", error.message);
            console.error("[authorize] Caught error stack:", error.stack);
          } else {
            console.error("[authorize] Caught unknown error:", JSON.stringify(error));
          }
          // Consistent with NextAuth docs for Credentials provider, return null on error.
          // This should lead to ?error=CredentialsSignin or be handled by the generic "Configuration" error.
          return null;
        }
      },
    })
  ],
  session: {
    strategy: "jwt", // Using JWT for session strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days (default longer duration)
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("[signIn callback] Triggered.");
      console.log("[signIn callback] User:", user ? JSON.stringify(user) : "undefined");
      console.log("[signIn callback] Account:", account ? JSON.stringify(account) : "undefined");
      console.log("[signIn callback] Profile:", profile ? JSON.stringify(profile) : "undefined");
      console.log("[signIn callback] Email:", email ? JSON.stringify(email) : "undefined");
      console.log("[signIn callback] Credentials:", credentials ? JSON.stringify(credentials) : "undefined");
      return true;
    },
    async jwt({ token, user }) { // user here is the user object from authorize or OAuth provider
      // Persist 'id' and 'role' to the JWT right after signin
      if (user) { // User object is only passed on first call (signin)
        token.id = user.id;
        token.role = user.role;
        // If 'rememberMe' is part of your augmented User type and set in 'authorize'
        if ((user as any).rememberMe !== undefined) {
           token.rememberMe = (user as any).rememberMe;
        }
      }
      // console.log('[jwt callback] Token:', JSON.stringify(token)); // Optional: for deeper debugging
      return token;
    },
    async session({ session, token }) { // token here is the JWT
      if (token.id && session.user) {
        session.user.id = token.id;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string;
      }
      if (token.rememberMe !== undefined && session.user) {
        session.user.rememberMe = token.rememberMe;
      }
      // console.log('[session callback] Session:', JSON.stringify(session)); // Optional: for deeper debugging
      if (process.env.NODE_ENV !== 'production') { // Keep existing session log for dev
        console.log('Auth: Session created/updated:', JSON.stringify(session));
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Redirect users to /login page for sign-in
    error: '/auth/error', // Custom error page
    // signOut: '/auth/signout' // (optional)
  },
  secret: process.env.NEXTAUTH_SECRET, // Essential for production! Add to .env.local
  debug: process.env.NODE_ENV === 'development', // Enable debug messages in development
};

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
export const { handlers: { GET, POST }, auth } = NextAuth(authOptions);
