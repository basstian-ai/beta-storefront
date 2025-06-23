// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Corrected import: login service from bff/services which then calls the adapter
import { login as bffLogin } from '@/bff/services';
import { error as logError } from "@/lib/logger"; // Assuming logger is still wanted

// Augment NextAuth types for v4
// These declarations should ideally be in a *.d.ts file (e.g., next-auth.d.ts)
// For simplicity here, keeping them in the route file.
declare module "next-auth" {
  interface Session {
    accessToken?: string; // To store the access token from DummyJSON
    user: {
      id?: string | number; // Keep id on user object in session
    } & NextAuthUser; // Retain other default user fields (name, email, image)
  }

  // The User object returned by the authorize callback
  interface User extends NextAuthUser {
    id: string | number; // id is essential
    accessToken?: string; // This will hold the token from DummyJSON response
    // Include other fields from DummyJSON that you want on the NextAuth User object
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  // JWT token stored by NextAuth
  interface JWT {
    id?: string | number;
    accessToken?: string; // To store the access token from DummyJSON
    // name, email, picture are standard JWT claims NextAuth might add
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "DummyJSON", // Provider name
      credentials: {
        username: { label: "Username", type: "text", placeholder: "kminchelle" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          logError('Auth: Missing username or password in credentials');
          return null; // Return null for missing credentials
        }

        try {
          // bffLogin now calls the adapter, which returns an object with 'accessToken'
          // and other user fields (id, username, email, etc.)
          const userFromBff = await bffLogin({
            username: credentials.username,
            password: credentials.password
          });

          if (userFromBff && userFromBff.accessToken) {
            // The object returned here becomes the `user` parameter in the `jwt` callback
            // Ensure it includes all necessary fields for the JWT and session
            // The 'id' field is crucial.
            // The structure should match the augmented `User` type.
            console.log('Auth: User authorized by BFF:', userFromBff);
            return {
              id: String(userFromBff.id), // Ensure id is a string if consistently used as such
              name: [userFromBff.firstName, userFromBff.lastName].filter(Boolean).join(' ') || userFromBff.username,
              email: userFromBff.email,
              image: userFromBff.image,
              accessToken: userFromBff.token, // Changed from userFromBff.accessToken to userFromBff.token
              // Pass through other user details from bffLogin if needed by JWT/session
              username: userFromBff.username,
              firstName: userFromBff.firstName,
              lastName: userFromBff.lastName,
              gender: userFromBff.gender,
            };
          } else {
            logError('Auth: BFF login failed or did not return accessToken', { userFromBff });
            return null; // Failed login
          }
        } catch (error) {
          logError('Auth: Error in authorize callback:', error);
          return null; // Failed login due to error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only passed on initial sign-in.
      // Persist the accessToken and user ID from the `user` object (from `authorize`) into the JWT
      if (user) {
        token.accessToken = user.accessToken; // user.accessToken comes from authorize
        token.id = user.id;
        // token.name = user.name; // Optional: if you want name in JWT
        // token.email = user.email; // Optional: if you want email in JWT
        // token.picture = user.image; // Optional: if you want picture in JWT
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user ID from the JWT.
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token?.id) {
        // If session.user is not automatically populated with name, email, image
        // from standard JWT claims, ensure they are set if needed.
        // For v4, session.user is typically already partially filled.
        // We just need to add our custom fields like id.
        if (session.user) {
            session.user.id = token.id as string | number;
        }
      }
      // console.log("Auth: Session created/updated:", session);
      return session;
    },
  },
  pages: {
    signIn: '/login', // Custom login page
    error: '/auth/error', // Custom error page for auth errors (e.g., OAuth errors)
  },
  // secret: process.env.NEXTAUTH_SECRET, // IMPORTANT: Set this in .env.local for production
  debug: process.env.NODE_ENV !== 'production', // Enable debug messages in development
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
