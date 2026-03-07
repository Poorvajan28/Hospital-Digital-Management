"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, User, Lock, Eye, EyeOff, Loader2, Heart, Activity, Stethoscope, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const roles = [
    { value: "patient", label: "Patient", description: "Book appointments & view records", icon: Heart },
    { value: "nurse", label: "Nurse", description: "Patient care & scheduling", icon: Activity },
    { value: "physician", label: "Physician", description: "Diagnoses & prescriptions", icon: Stethoscope },
    { value: "admin", label: "Administrator", description: "System management", icon: Shield },
];

function LoginContent() {
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
                window.location.href = callbackUrl;
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#134e4a] animate-gradient" />

            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute top-[40%] right-[20%] w-48 h-48 bg-emerald-400/8 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

                {/* Floating medical icons */}
                <Heart className="absolute top-[15%] right-[15%] h-6 w-6 text-white/10 animate-float" style={{ animationDelay: "0s" }} />
                <Activity className="absolute bottom-[25%] left-[10%] h-8 w-8 text-white/10 animate-float-slow" style={{ animationDelay: "1s" }} />
                <Stethoscope className="absolute top-[60%] right-[8%] h-7 w-7 text-white/10 animate-float" style={{ animationDelay: "3s" }} />
                <Shield className="absolute top-[20%] left-[20%] h-5 w-5 text-white/10 animate-float-slow" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 border border-white/20 transition-transform hover:scale-105">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">MediCore</h1>
                        <p className="text-xs text-teal-200/80">Hospital Management System</p>
                    </div>
                </div>

                {/* Main Card — Glassmorphism */}
                <div className="animate-scale-in backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl shadow-black/20 overflow-hidden" style={{ animationDelay: "0.2s" }}>
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white animate-blur-in" style={{ animationDelay: "0.3s" }}>Welcome Back</h2>
                            <p className="text-teal-200/70 text-sm mt-1 animate-blur-in" style={{ animationDelay: "0.4s" }}>
                                Sign in to access your healthcare dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 stagger-children">
                            {error && (
                                <Alert variant="destructive" className="bg-red-500/20 border-red-400/30 text-white">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-white/90 text-sm font-medium">Select Role</Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors focus:ring-teal-400/50 h-11 rounded-xl">
                                        <SelectValue placeholder="Choose your role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {roles.map((r) => (
                                            <SelectItem key={r.value} value={r.value} className="rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <r.icon className="h-4 w-4 text-teal-600" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{r.label}</span>
                                                        <span className="text-xs text-muted-foreground">{r.description}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white/90 text-sm font-medium">Email</Label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors group-focus-within:text-teal-300" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="doctor@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 hover:bg-white/15 focus:bg-white/15 transition-colors focus:ring-teal-400/50 h-11 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white/90 text-sm font-medium">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors group-focus-within:text-teal-300" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 hover:bg-white/15 focus:bg-white/15 transition-colors focus:ring-teal-400/50 h-11 rounded-xl"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-sm text-teal-300/80 hover:text-teal-200 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-white text-teal-900 hover:bg-white/90 font-semibold text-base rounded-xl shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="font-medium text-white/90 text-sm mb-2">Demo Credentials:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-teal-200/70"><strong className="text-white/80">Admin:</strong> admin@example.com</div>
                                <div className="text-teal-200/70"><strong className="text-white/80">Pass:</strong> admin123</div>
                                <div className="text-teal-200/70"><strong className="text-white/80">Doctor:</strong> doctor@example.com</div>
                                <div className="text-teal-200/70"><strong className="text-white/80">Pass:</strong> doctor123</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-white/60 mt-6 animate-slide-up" style={{ animationDelay: "0.5s" }}>
                    New patient?{" "}
                    <Link href="/signup" className="text-teal-300 hover:text-teal-200 font-medium transition-colors">
                        Register here
                    </Link>
                </p>

                {/* Footer */}
                <p className="text-center text-xs text-white/30 mt-6 animate-slide-up" style={{ animationDelay: "0.6s" }}>
                    MediCore Hospital Management System
                    <br />
                    <span className="text-teal-300/50">Secure • Efficient • Reliable</span>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#134e4a]">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
