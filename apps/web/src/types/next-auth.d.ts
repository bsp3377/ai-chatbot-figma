import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            workspaceId: string;
            role: "OWNER" | "ADMIN" | "VIEWER";
            workspace: any;
        } & DefaultSession["user"];
    }

    interface User {
        workspaceId: string;
        role: "OWNER" | "ADMIN" | "VIEWER";
        workspace: any;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        workspaceId: string;
        role: "OWNER" | "ADMIN" | "VIEWER";
        workspace: any;
    }
}
