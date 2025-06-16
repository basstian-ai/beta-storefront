// src/app/api/auth/[...nextauth]/route.ts
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
      async authorize(credentials) { // Removed _req
        if (!credentials?.username || !credentials?.password) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Auth: Missing username or password in credentials');
          }
          return null;
        }
        try {
          // Call your BFF login service
          const loginData = await bffLogin({
            username: credentials.username,
            password: credentials.password
          });

          // Validate response with Zod (AuthResponseSchema includes token and user details)
          const parsedLoginResponse = AuthResponseSchema.parse(loginData);

          // DummyJSON returns a user object with 'id', 'username', 'email', 'firstName', 'lastName', 'gender', 'image', 'token'
          // We need to map this to what NextAuth expects for its User object.
          // The 'role' for "b2b" needs to be determined. dummyjson doesn't provide it.
          // For testing, let's assume 'kminchelle' is a b2b user.
          let userRole = "customer"; // Default role
          if (parsedLoginResponse.username === "kminchelle") {
            userRole = "b2b";
          }

          // The user object returned by authorize will be stored in the JWT
          // Ensure the id property here matches what you declared in the User interface augmentation
          const user: User = { // Use the augmented User type
            id: parsedLoginResponse.id,
            name: parsedLoginResponse.username,
            email: parsedLoginResponse.email,
            image: parsedLoginResponse.image,
            role: userRole,
            rememberMe: credentials.rememberMe === 'true' || credentials.rememberMe === true, // Add this
          };
          if (process.env.NODE_ENV !== 'production') {
            console.log('Auth: User authorized:', user);
          }
          return user;

        } catch (error: unknown) { // Changed error type to unknown
          if (process.env.NODE_ENV !== 'production') {
            if (error instanceof z.ZodError) {
              console.error('Auth: Zod validation error in authorize callback:', error.errors);
            } else if (error instanceof Error) { // Check if error is an instance of Error
              console.error('Auth: Error in authorize callback:', error.message);
            } else {
              console.error('Auth: Unknown error in authorize callback:', error);
            }
          }
          // Regardless of error type, return null for auth failure
          // Return null if authentication fails
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt", // Using JWT for session strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days (default longer duration)
  },
  callbacks: {
    async jwt({ token, user }) { // Removed _account, _profile
      // Persist 'id' and 'role' to the JWT right after signin
      if (user) { // User object is only passed on first call (signin)
        token.id = user.id;
        token.role = user.role;
        token.rememberMe = user.rememberMe; // Removed 'as any'
        // token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) { // Removed _user
      // Send properties to the client, like an access_token and user id from a provider.
      if (token.id && session.user) {
        session.user.id = token.id;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string;
      }
      if (token.rememberMe !== undefined && session.user) {
        session.user.rememberMe = token.rememberMe; // Removed 'as any'
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
  secret: process.env.NEXTAUTH_SECRET, // Essential for production! Add to .env.local
  // debug: process.env.NODE_ENV === 'development', // Enable debug messages in development
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
