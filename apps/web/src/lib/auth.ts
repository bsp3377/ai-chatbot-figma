import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

// Mock user database for development
type Plan = "FREE" | "STARTER" | "PRO" | "BUSINESS";

const MOCK_USERS: Array<{
    id: string;
    email: string;
    name: string;
    password: string;
    workspaceId: string;
    role: "OWNER" | "ADMIN" | "VIEWER";
    workspace: {
        id: string;
        name: string;
        slug: string;
        plan: Plan;
    };
}> = [
        {
            id: "user_1",
            email: "demo@chatbotai.com",
            name: "Demo User",
            password: "demo1234",
            workspaceId: "ws_1",
            role: "OWNER",
            workspace: {
                id: "ws_1",
                name: "Demo Workspace",
                slug: "demo",
                plan: "PRO",
            },
        },
    ];

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);

                if (!parsed.success) {
                    return null;
                }

                const { email, password } = parsed.data;

                // Mock authentication - in production, use database
                const user = MOCK_USERS.find(
                    (u) => u.email === email && u.password === password
                );

                if (!user) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    workspaceId: user.workspaceId,
                    role: user.role,
                    workspace: user.workspace,
                } as any;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.workspaceId = (user as any).workspaceId;
                token.role = (user as any).role;
                token.workspace = (user as any).workspace;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).workspaceId = token.workspaceId;
                (session.user as any).role = token.role;
                (session.user as any).workspace = token.workspace;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
    trustHost: true,
});

// Mock function to register a new user
export async function registerUser(data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
}) {
    console.log("[Mock] Registering user:", data.email);

    const newUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.name,
        workspaceId: `ws_${Date.now()}`,
        role: "OWNER" as const,
        workspace: {
            id: `ws_${Date.now()}`,
            name: data.companyName,
            slug: data.companyName.toLowerCase().replace(/\s+/g, "-"),
            plan: "FREE" as Plan,
        },
    };

    MOCK_USERS.push({ ...newUser, password: data.password });

    return newUser;
}
