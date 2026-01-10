"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const resetPasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        setError(null);

        if (!token) {
            setError("Invalid or missing reset token. Please request a new password reset link.");
            return;
        }

        try {
            // TODO: Implement actual password reset logic
            // For now, simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // In a real implementation, you would:
            // 1. Call your API with the token and new password
            // 2. Handle errors appropriately
            // 3. Redirect to login on success

            setIsSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError("Failed to reset password. Please try again.");
        }
    };

    // Show error if no token
    if (!token) {
        return (
            <Card className="shadow-xl border-0">
                <CardContent className="pt-8 pb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                    <p className="text-gray-600 mb-6">
                        This password reset link is invalid or has expired.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/forgot-password">Request a new reset link</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Show success message
    if (isSuccess) {
        return (
            <Card className="shadow-xl border-0">
                <CardContent className="pt-8 pb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been successfully reset. Redirecting to sign in...
                    </p>
                    <div className="flex justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
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
                <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
                <CardDescription>
                    Enter your new password below
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
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className={errors.password ? "border-red-500" : ""}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("confirmPassword")}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Password requirements */}
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>Password must:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            <li>Be at least 8 characters long</li>
                            <li>Contain at least one letter and one number (recommended)</li>
                        </ul>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Resetting password...
                            </>
                        ) : (
                            "Reset password"
                        )}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-blue-600 font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
