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

import NextAuth, { type NextAuthOptions, User as NextAuthUser, logger } from 'next-auth'; // Added logger, type for NextAuthOptions
import CredentialsProvider from 'next-auth/providers/credentials';
import { login as bffLogin, refreshAccessToken as bffRefreshAccessToken } from '@/bff/services'; // Your BFF login service & refresh
import { AuthResponseSchema } from '@/bff/types';
import { z } from 'zod';

// Augment NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
      rememberMe?: boolean;
      accessToken?: string;
      // refreshToken?: string; // DO NOT EXPOSE REFRESH TOKEN TO CLIENT
      expires_at?: number;  // Expose token expiry to client
      error?: string;       // Expose potential token errors
    } & Omit<NextAuthUser, 'id' | 'image'> & { image?: string | null }; // Keep image, Omit default id
  }
  interface User extends NextAuthUser {
    id: string;
    role?: string;
    rememberMe?: boolean;
    token?: string;
    refreshToken?: string;
    expiresInMins?: number; // Added for initial expiry calculation
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    rememberMe?: boolean;
    accessToken?: string;
    refreshToken?: string;
    expires_at?: number;   // Added for token expiry timestamp
    error?: string;        // To signal token refresh errors
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}

const isProduction = process.env.NODE_ENV === 'production';

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
          // Determine expiresInMins based on rememberMe flag
          const defaultTtlStr = process.env.DUMMYJSON_TOKEN_TTL_MINS || '30';
          const rememberMeTtlStr = process.env.DUMMYJSON_REMEMBER_ME_TTL_MINS || '43200'; // 30 days

          const defaultTtl = parseInt(defaultTtlStr, 10);
          const rememberMeTtl = parseInt(rememberMeTtlStr, 10);

          let expiresInMins = (Number.isNaN(defaultTtl) || defaultTtl <=0) ? 30 : defaultTtl; // Fallback to 30 if env var is invalid
          if (credentials.rememberMe === true || credentials.rememberMe === 'true') {
            expiresInMins = (Number.isNaN(rememberMeTtl) || rememberMeTtl <=0) ? 43200 : rememberMeTtl; // Fallback to 30 days if env var is invalid
          }
          if (process.env.NODE_ENV === 'development') { // Or if (!isProduction)
            logger.debug(`[authorize] Determined expiresInMins: ${expiresInMins} (rememberMe: ${credentials.rememberMe})`);
          }


          // Call your BFF login service, now passing expiresInMins
          const loginData = await bffLogin(
            {
              username: credentials.username,
              password: credentials.password,
            },
            expiresInMins
          );

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
            id: parsedLoginResponse.id,            // id is already a string from AuthResponseSchema
            name: parsedLoginResponse.name,        // Use combined name from normalized response
            email: parsedLoginResponse.email,
            image: parsedLoginResponse.image,
            role: userRole,
            // Pass token and refreshToken to be available in the jwt callback via the user object
            token: parsedLoginResponse.token,
            refreshToken: parsedLoginResponse.refreshToken,
            expiresInMins: parsedLoginResponse.expiresInMins, // Pass this through
            // rememberMe is handled by checking credentials directly
          };

          // Add rememberMe if present in credentials (this part of existing logic is fine)
          if (credentials.rememberMe) {
              userForNextAuth.rememberMe = credentials.rememberMe === 'true' || credentials.rememberMe === true;
          }


          // console.log("[authorize] Successfully constructed user object for NextAuth:", JSON.stringify(userForNextAuth)); // Removed
          return userForNextAuth;

        } catch (error) {
          logger.error("[authorize] Error during authorization flow. Username: ", credentials?.username);
          // Log details of the error
          if (error instanceof z.ZodError) { // This would be if AuthResponseSchema parsing fails
            logger.error("[authorize] Zod validation error for AuthResponseSchema:", JSON.stringify(error.errors));
          } else if (error instanceof Error) { // This catches errors from bffLogin/dummyJsonAdapter
            logger.error("[authorize] Caught error message from BFF/Adapter:", error.message);
            // logger.error("[authorize] Caught error stack:", error.stack); // Optional: stack might be too verbose for prod
          } else {
            logger.error("[authorize] Caught unknown error:", JSON.stringify(error));
          }

          // Return null to trigger NextAuth's standard CredentialsSignin error flow
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
      // console.log("[jwt callback] Triggered. Profile:", JSON.stringify(profile));
      // console.log("[jwt callback] Initial token:", JSON.stringify(token));

      if (account && user) { // Initial sign-in
        // This block runs only on sign-in
        // The user object is from the authorize callback
        token.accessToken = user.token;       // user.token is the accessToken from authorize
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;

        // Calculate expiry time
        // user.expiresInMins should come from authorize -> bffLogin -> dummyJsonAdapter.login
        const expiresInMilliseconds = (user.expiresInMins || 30) * 60 * 1000; // Default to 30 mins if not provided
        token.expires_at = Date.now() + expiresInMilliseconds;

        if (user.rememberMe !== undefined) {
          token.rememberMe = user.rememberMe;
        }
        // console.log(`[jwt callback] New token on login: ${JSON.stringify(token)}`);
        return token;
      }

      // On subsequent calls, token.expires_at should exist.
      // Check if the token is expired
      if (token.expires_at && Date.now() < (token.expires_at as number)) {
        // Not expired, return the current token
        // console.log("[jwt callback] Token not expired.");
        return token;
      }

      // Token is expired or about to expire, try to refresh it
      // console.log("[jwt callback] Token expired or needs refresh. Attempting refresh...");
      if (!token.refreshToken) {
        logger.warn("[jwt callback] No refresh token available to refresh access token."); // Changed to logger.warn
        return { ...token, error: "RefreshFailure" };
      }

      try {
        const refreshedTokenData = await bffRefreshAccessToken(token.refreshToken as string);
        // console.log("[jwt callback] Refreshed token data:", JSON.stringify(refreshedTokenData));

        // Update the token with new values from refresh
        token.accessToken = refreshedTokenData.newAccessToken;
        token.refreshToken = refreshedTokenData.newRefreshToken;

        const newExpiresInMilliseconds = (refreshedTokenData.newExpiresInMins || 30) * 60 * 1000;
        token.expires_at = Date.now() + newExpiresInMilliseconds;

        token.id = String(refreshedTokenData.id);
        token.name = `${refreshedTokenData.firstName} ${refreshedTokenData.lastName}`;
        token.email = refreshedTokenData.email;
        token.picture = refreshedTokenData.image;
        // token.role = refreshedTokenData.role; // If available and needed

        // console.log(`[jwt callback] Token refreshed: ${JSON.stringify(token)}`);
        return token;

      } catch (error) {
        if (error instanceof Error) {
          logger.error("[jwt callback] Error refreshing access token:", error.message);
        } else {
          logger.error("[jwt callback] Error refreshing access token (non-Error object):", JSON.stringify(error));
        }
        return {
          ...token,
          error: "RefreshAccessTokenError",
          accessToken: undefined,
          expires_at: 0
        };
      }
    },
    async session({ session, token }) { // token is the JWT
      // console.log("[session callback] Triggered. JWT token:", JSON.stringify(token));
      // console.log("[session callback] Initial session:", JSON.stringify(session));

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        if (token.rememberMe !== undefined) {
          session.user.rememberMe = token.rememberMe;
        }
        if (token.accessToken) {
          session.user.accessToken = token.accessToken as string;
        }
        // refreshToken is intentionally not passed to the client-side session
        if (token.expires_at) {
          session.user.expires_at = token.expires_at as number;
        }
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image; // map from token.picture
        if (token.error) {
          session.user.error = token.error as string;
        }
        // Ensure refreshToken is NOT assigned to session.user
        // delete (session.user as any).refreshToken; // Or ensure it's never added by not mapping it
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
  cookies: {
    sessionToken: {
      name: isProduction ? `__Host-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // Recommended default by NextAuth
        path: '/',
        secure: isProduction,
        // domain: isProduction ? 'yourdomain.com' : undefined, // Only set if using custom domain and need cross-subdomain
      }
    },
    // If other cookies (callbackUrl, csrfToken, pkceCodeVerifier) are explicitly defined here,
    // they would also need similar conditional naming and `secure: isProduction`
    // For now, only overriding sessionToken as requested.
    // NextAuth's defaults for other cookies are generally secure.
  },
};

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
export const { handlers: { GET, POST }, auth } = NextAuth(authOptions);
