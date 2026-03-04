"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const roles = [
    { value: "patient", label: "Patient", description: "Book appointments & view records" },
    { value: "nurse", label: "Nurse", description: "Patient care & scheduling" },
    { value: "physician", label: "Physician", description: "Diagnoses & prescriptions" },
    { value: "admin", label: "Administrator", description: "System management" },
];

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!role) {
            setError("Please select a role");
            setIsLoading(false);
            return;
        }

        try {
            const result = await signIn("credentials", {
                email,
                password,
                role,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError(result.error === "CredentialsSignin"
                    ? "Invalid email or password"
                    : "Authentication failed");
            } else if (result?.ok) {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to access your healthcare dashboard
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="role">Select Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{r.label}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {r.description}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="doctor@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
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
                            </div>

                            {/* Demo Credentials Info */}
                            <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                <p className="font-medium text-blue-900 mb-1">Demo Credentials:</p>
                                <p className="text-blue-700">
                                    <strong>Patient:</strong> patient@example.com / patient123
                                </p>
                                <p className="text-blue-700">
                                    <strong>Nurse:</strong> nurse@example.com / nurse123
                                </p>
                                <p className="text-blue-700">
                                    <strong>Physician:</strong> doctor@example.com / doctor123
                                </p>
                                <p className="text-blue-700">
                                    <strong>Admin:</strong> admin@example.com / admin123
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    New patient?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/signup")}
                        className="text-teal-600 hover:underline font-medium"
                    >
                        Register here
                    </button>
                </p>

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
