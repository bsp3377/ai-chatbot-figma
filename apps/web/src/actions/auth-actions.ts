'use server';

import { registerUser } from "@/lib/auth";

export async function register(data: {
    name: string;
    email: string;
    companyName: string;
    password: string;
}) {
    try {
        await registerUser(data);
        return { success: true };
    } catch (error: any) {
        console.error("Registration error:", error);
        return { success: false, error: error.message };
    }
}
