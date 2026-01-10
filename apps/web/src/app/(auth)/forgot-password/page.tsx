"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setError(null);

        // TODO: Implement actual password reset email logic
        // For now, simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In a real implementation, you would:
        // 1. Call your API to send reset email
        // 2. Handle errors appropriately
        // 3. Show success message

        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <Card className="shadow-xl border-0">
                <CardContent className="pt-8 pb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
                    <p className="text-gray-600 mb-6">
                        We&apos;ve sent a password reset link to{" "}
                        <span className="font-medium">{getValues("email")}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Didn&apos;t receive the email? Check your spam folder or{" "}
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-blue-600 hover:underline"
                        >
                            try again
                        </button>
                    </p>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to sign in
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
                <CardDescription>
                    No worries! Enter your email and we&apos;ll send you a reset link.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                {...register("email")}
                                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending reset link...
                            </>
                        ) : (
                            "Send reset link"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
