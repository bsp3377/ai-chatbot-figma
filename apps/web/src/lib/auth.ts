import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { compare, hash } from "bcryptjs";

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

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { workspace: true }
                });

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = await compare(password, user.passwordHash);

                if (!isValid) {
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
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
});

export async function registerUser(data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
}) {
    console.log("Registering user:", data.email);

    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await hash(data.password, 10);

    // Create user and workspace in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
            data: {
                name: data.companyName,
                slug: data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
                plan: "FREE",
            }
        });

        const user = await tx.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash,
                role: "OWNER",
                workspaceId: workspace.id,
            }
        });

        return user;
    });

    return newUser;
}
