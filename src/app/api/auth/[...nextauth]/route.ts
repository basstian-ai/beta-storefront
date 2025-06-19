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
// console.log("[NextAuth Env Check]", { // Removed
//   NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not Set", // Removed
//   NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET, // Removed
//   NODE_ENV: process.env.NODE_ENV || "Not Set", // Removed
//   VERCEL_URL: process.env.VERCEL_URL || "Not Set", // Removed
//   AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "Not Set" // Removed
// }); // Removed

import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login as bffLogin } from '@/bff/services'; // Your BFF login service
import { AuthResponseSchema } from '@/bff/types'; // Removed UserSchema as it's unused
import { z } from 'zod';

// Augment NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string; // Consistent with String(id) from authorize
      role?: string;
      rememberMe?: boolean;
      accessToken?: string; // To be exposed to client if needed
      refreshToken?: string; // To be exposed to client if needed (consider security implications)
      // name, email, image are often part of NextAuthUser or added by default if in token
    } & Omit<NextAuthUser, 'id'>; // Omit default number id, use our string one
  }
  interface User extends NextAuthUser { // User obj from authorize
    id: string; // authorize now ensures string id
    role?: string;
    rememberMe?: boolean;
    token?: string;        // Normalized token from bff, available in 'user' obj in 'jwt' callback
    refreshToken?: string; // Normalized refresh token from bff, available in 'user' obj in 'jwt' callback
    // name, email, image are part of NextAuthUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    rememberMe?: boolean;
    accessToken?: string;  // Stored in JWT as accessToken
    refreshToken?: string; // Stored in JWT as refreshToken
    // name, email, picture (for image) should be here if session needs them
    name?: string | null;
    email?: string | null;
    picture?: string | null; // NextAuth default maps user.image to token.picture
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
      async authorize(credentials, _req) { // Changed req to _req
        // console.log("[authorize] Raw request (if needed):", _req);
        // console.log("[authorize] Inbound credentials:", credentials ? JSON.stringify(credentials) : "undefined"); // Removed

        if (!credentials?.username || !credentials?.password) {
          // console.warn('[authorize] Missing username or password in credentials'); // Removed
          return null; // Keep this direct return for missing credentials
        }

        try {
          // Call your BFF login service (already in existing code)
          const loginData = await bffLogin({
            username: credentials.username,
            password: credentials.password
          });

          if (!loginData) {
            // console.warn("[authorize] BFF login service returned no data (loginData is null or undefined). Username: ", credentials.username); // Removed
            return null; // Explicitly return null if loginData is null/undefined
          }
          // console.log("[authorize] Data received from bffLogin:", JSON.stringify(loginData)); // Removed

          // Validate response with Zod (already in existing code)
          const parsedLoginResponse = AuthResponseSchema.parse(loginData);
          // console.log("[authorize] Parsed login response from Zod:", JSON.stringify(parsedLoginResponse)); // Removed

          // Determine role
          let userRole = "customer"; // Default role
          // Example: Assign 'b2b' role if username is specific, otherwise 'customer'
          if (parsedLoginResponse.username === "emilys") { // Updated to new default user
            userRole = "customer"; // Explicitly customer, or apply specific logic
          } else if (parsedLoginResponse.username === "kminchelle") { // Keep if kminchelle might still be used
            userRole = "b2b";
          }
          // Add other role logic as needed
          // console.log("[authorize] Determined user role:", userRole); // Removed

          // Construct the user object for NextAuth
          // The augmented 'User' type will be updated in the next step to include token/refreshToken
          const userForNextAuth: User = { // This will be typed as 'User' from NextAuth augmentation implicitly or explicitly
            id: String(parsedLoginResponse.id),    // Ensure ID is string
            name: parsedLoginResponse.name,        // Use combined name from normalized response
            email: parsedLoginResponse.email,
            image: parsedLoginResponse.image,
            role: userRole,
            // Pass token and refreshToken to be available in the jwt callback via the user object
            token: parsedLoginResponse.token,
            refreshToken: parsedLoginResponse.refreshToken,
            // rememberMe is handled by checking credentials directly
          };

          // Add rememberMe if present in credentials (this part of existing logic is fine)
          if (credentials.rememberMe) {
              userForNextAuth.rememberMe = credentials.rememberMe === 'true' || credentials.rememberMe === true;
          }


          // console.log("[authorize] Successfully constructed user object for NextAuth:", JSON.stringify(userForNextAuth)); // Removed
          return userForNextAuth;

        } catch (error) {
          console.error("[authorize] Error during authorization flow. Username: ", credentials?.username); // Added optional chaining for credentials
          let errorMessage = "Authorization failed due to an unexpected error.";
          if (error instanceof z.ZodError) {
            console.error("[authorize] Zod validation error:", JSON.stringify(error.errors));
            errorMessage = "User data validation failed after login."; // More specific than generic
          } else if (error instanceof Error) {
            console.error("[authorize] Caught error message:", error.message);
            console.error("[authorize] Caught error stack:", error.stack);
            errorMessage = error.message; // Use the actual error message from bffLogin/dummyJsonAdapter
          } else {
            const unknownErrorStr = JSON.stringify(error);
            console.error("[authorize] Caught unknown error:", unknownErrorStr);
            errorMessage = `An unknown error occurred: ${unknownErrorStr.slice(0, 100)}`; // Include part of unknown error
          }
          // Instead of returning null, throw an error that NextAuth will catch.
          // NextAuth typically creates a URL like /api/auth/error?error=Callback&message=...
          // Or it might use a specific error code if the error message matches certain patterns.
          // For a generic error thrown from authorize, it often results in ?error=Callback or similar.
          // The key is that the thrown error's message might be accessible on the error page.
          throw new Error(errorMessage);
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
      // console.log("[signIn callback] Triggered."); // Removed
      // console.log("[signIn callback] User:", user ? JSON.stringify(user) : "undefined"); // Removed
      // console.log("[signIn callback] Account:", account ? JSON.stringify(account) : "undefined"); // Removed
      // console.log("[signIn callback] Profile:", profile ? JSON.stringify(profile) : "undefined"); // Removed
      // console.log("[signIn callback] Email:", email ? JSON.stringify(email) : "undefined"); // Removed
      // console.log("[signIn callback] Credentials:", credentials ? JSON.stringify(credentials) : "undefined"); // Removed
      return true;
    },
    async jwt({ token, user, account, profile }) { // Added account, profile for completeness
      // console.log("[jwt callback] Triggered. User:", JSON.stringify(user)); // Removed
      // console.log("[jwt callback] Triggered. Account:", JSON.stringify(account)); // Removed
      // console.log("[jwt callback] Triggered. Profile:", JSON.stringify(profile)); // Removed
      // console.log("[jwt callback] Initial token:", JSON.stringify(token)); // Removed

      if (user) { // User object is available on initial sign-in. `user` here is the object from `authorize` or OAuth provider.
        token.id = user.id; // user.id is already string from authorize
        token.role = user.role;
        if (user.rememberMe !== undefined) {
          token.rememberMe = user.rememberMe;
        }
        // Map from our normalized User object (from authorize) to JWT fields
        if (user.token) { // user.token comes from authorize's userForNextAuth.token
          token.accessToken = user.token;
        }
        if (user.refreshToken) { // user.refreshToken from authorize's userForNextAuth.refreshToken
          token.refreshToken = user.refreshToken;
        }
        // Ensure standard fields are on the token for the session callback
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image; // NextAuth convention for image
      }
      // console.log("[jwt callback] Returned token:", JSON.stringify(token)); // Removed
      return token;
    },
    async session({ session, token }) { // token is the JWT
      // console.log("[session callback] Triggered. JWT token:", JSON.stringify(token)); // Removed
      // console.log("[session callback] Initial session:", JSON.stringify(session)); // Removed

      if (session.user) {
        session.user.id = token.id as string; // Ensure type if needed, though JWT should have string
        session.user.role = token.role as string;
        if (token.rememberMe !== undefined) {
          session.user.rememberMe = token.rememberMe;
        }
        if (token.accessToken) {
          session.user.accessToken = token.accessToken as string;
        }
        if (token.refreshToken) {
          session.user.refreshToken = token.refreshToken as string;
        }
        // Ensure standard fields are populated from token
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image; // map from token.picture
      }

      // if (process.env.NODE_ENV !== 'production') { // Removed
      //    console.log('Auth: Session created/updated:', JSON.stringify(session)); // Removed
      // } // Removed
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
