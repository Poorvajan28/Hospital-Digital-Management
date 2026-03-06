"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

    useEffect(() => {
        // Validate token on mount
        if (token) {
            // In production, validate token with backend
            // For demo, we'll accept any token
            setIsValidToken(true);
        } else {
            setIsValidToken(false);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to reset password");
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isValidToken === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50 p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    <p className="text-gray-600">Validating reset link...</p>
                </div>
            </div>
        );
    }

    // Invalid token
    if (isValidToken === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50 p-4">
                <div className="w-full max-w-md">
                    <Card className="border-0 shadow-2xl">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                                <h3 className="text-lg font-semibold text-gray-900">Invalid Reset Link</h3>
                                <p className="text-sm text-gray-600">
                                    This password reset link is invalid or has expired.
                                </p>
                                <Button
                                    onClick={() => router.push("/forgot-password")}
                                    className="w-full bg-teal-600 hover:bg-teal-700 mt-4"
                                >
                                    Request New Reset Link
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => router.push("/login")}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50 p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-teal-900">MediCore</span>
                    </div>

                    <Card className="border-0 shadow-2xl">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                <h3 className="text-lg font-semibold text-gray-900">Password Reset Successful</h3>
                                <p className="text-sm text-gray-600">
                                    Your password has been reset successfully. You can now login with your new password.
                                </p>
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full bg-teal-600 hover:bg-teal-700 mt-4"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 mt-8">
                        MediCore Hospital Management System
                        <br />
                        <span className="text-teal-600">Secure • Efficient • Reliable</span>
                    </p>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-teal-900">MediCore</span>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
                        <CardDescription>
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => router.push("/login")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    MediCore Hospital Management System
                    <br />
                    <span className="text-teal-600">Secure • Efficient • Reliable</span>
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
