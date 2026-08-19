import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {
  findOrCreateOAuthUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
} from "@/lib/data/users";
import type { PlanId } from "@/types";

// The `next-auth/jwt` JWT interface can't be reliably augmented across pnpm's
// isolated node_modules, so the extra fields are typed locally via this cast.
type AppToken = {
  id?: string;
  plan?: PlanId;
  purchasedEventSlugs?: string[];
  isAdmin?: boolean;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Only register Google when both env vars are actually configured —
    // an empty/unset clientId shouldn't break every other auth method.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await findUserByEmail(email);
        if (!user) return null;

        const valid = await verifyPassword(user, password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          plan: user.plan,
          purchasedEventSlugs: user.purchasedEventSlugs,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Required when self-hosting outside Vercel (e.g. Hostinger) — Auth.js
  // otherwise rejects every request with an "UntrustedHost" error because it
  // can't verify the incoming Host header against a known platform.
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const dbUser = await findOrCreateOAuthUser({
          name: user.name ?? "WWC Fan",
          email: user.email,
          image: user.image ?? undefined,
        });
        user.id = dbUser.id;
        user.plan = dbUser.plan;
        user.purchasedEventSlugs = dbUser.purchasedEventSlugs;
        user.isAdmin = dbUser.isAdmin;
      }
      return true;
    },
    async jwt({ token, user }) {
      const t = token as typeof token & AppToken;
      if (user) {
        t.id = user.id;
        t.plan = user.plan ?? "free";
        t.purchasedEventSlugs = user.purchasedEventSlugs ?? [];
        t.isAdmin = user.isAdmin ?? false;
      } else if (t.id) {
        // Refresh plan/purchases/role from the store on subsequent requests
        const dbUser = await findUserById(t.id);
        if (dbUser) {
          t.plan = dbUser.plan;
          t.purchasedEventSlugs = dbUser.purchasedEventSlugs;
          t.isAdmin = dbUser.isAdmin ?? false;
        }
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as typeof token & AppToken;
      if (session.user) {
        session.user.id = t.id ?? "";
        session.user.plan = t.plan ?? "free";
        session.user.purchasedEventSlugs = t.purchasedEventSlugs ?? [];
        session.user.isAdmin = t.isAdmin ?? false;
      }
      return session;
    },
  },
});
