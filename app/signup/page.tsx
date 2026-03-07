"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, User, Lock, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight, Check, Heart, Activity, MapPin, Shield } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

const generatePatientId = () => {
    const prefix = "PT";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
};

const steps = [
    { id: 1, name: "Personal Info", icon: User },
    { id: 2, name: "Contact", icon: MapPin },
    { id: 3, name: "Medical", icon: Heart },
    { id: 4, name: "Insurance", icon: Shield },
];

export default function SignupPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [patientId] = useState(generatePatientId());
    const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        dateOfBirth: "", gender: "", password: "", confirmPassword: "",
        address: "", city: "", state: "Tamil Nadu", pincode: "", country: "India",
        emergencyName: "", emergencyPhone: "", emergencyRelationship: "",
        bloodGroup: "", height: "", weight: "",
        medicalConditions: [] as string[],
        currentMedications: "", allergies: "",
        hasInsurance: false, insuranceProvider: "", insuranceId: "", insuranceExpiry: "",
    });

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.gender) {
                    setError("Please fill in all required fields"); return false;
                }
                if (!formData.email.includes("@")) { setError("Please enter a valid email address"); return false; }
                if (formData.phone.length < 10) { setError("Please enter a valid phone number"); return false; }
                if (!formData.password || formData.password.length < 8) { setError("Password must be at least 8 characters"); return false; }
                if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return false; }
                break;
            case 2:
                if (!formData.address || !formData.city || !formData.pincode) { setError("Please fill in all required address fields"); return false; }
                if (!formData.emergencyName || !formData.emergencyPhone) { setError("Please provide emergency contact information"); return false; }
                break;
            case 3:
                if (!formData.bloodGroup) { setError("Please select your blood group"); return false; }
                break;
            case 4:
                if (formData.hasInsurance && (!formData.insuranceProvider || !formData.insuranceId)) {
                    setError("Please provide insurance details or uncheck the insurance option"); return false;
                }
                break;
        }
        setError("");
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setSlideDirection("right");
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const handleBack = () => {
        setSlideDirection("left");
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        setError("");
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_id: patientId,
                    first_name: formData.firstName, last_name: formData.lastName,
                    email: formData.email, phone: formData.phone,
                    date_of_birth: formData.dateOfBirth, gender: formData.gender,
                    address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
                    blood_group: formData.bloodGroup,
                    emergency_contact: `${formData.emergencyName} (${formData.emergencyRelationship}) - ${formData.emergencyPhone}`,
                    medical_history: formData.medicalConditions.join(", ") || "None",
                    current_medications: formData.currentMedications || "None",
                    allergies: formData.allergies || "None",
                    insurance_provider: formData.hasInsurance ? formData.insuranceProvider : null,
                    insurance_id: formData.hasInsurance ? formData.insuranceId : null,
                    insurance_expiry: formData.hasInsurance ? formData.insuranceExpiry : null,
                    password: formData.password,
                    status: "active", role: "patient",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Registration failed");
            }

            alert(`Registration successful!\n\nYour Patient ID: ${patientId}\n\nPlease login with your email and password.`);
            router.push("/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during registration");
        } finally {
            setIsLoading(false);
        }
    };

    const updateFormData = (field: string, value: string | boolean | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const medicalConditionsOptions = [
        "Diabetes", "Hypertension", "Heart Disease", "Asthma",
        "Cancer", "Kidney Disease", "Liver Disease", "Thyroid Disorder", "None",
    ];

    // Input class for glassmorphism
    const inputClass = "bg-white/10 border-white/20 text-white placeholder:text-white/30 hover:bg-white/15 focus:bg-white/15 transition-colors focus:ring-teal-400/50 h-11 rounded-xl";
    const labelClass = "text-white/90 text-sm font-medium";

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-slide-up" key="step-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className={labelClass}>First Name *</Label>
                                <Input placeholder="John" value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Last Name *</Label>
                                <Input placeholder="Doe" value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)} className={inputClass} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClass}>Email Address *</Label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors group-focus-within:text-teal-300" />
                                <Input type="email" placeholder="john.doe@email.com" value={formData.email} onChange={(e) => updateFormData("email", e.target.value)} className={`pl-10 ${inputClass}`} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClass}>Phone Number *</Label>
                            <Input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className={labelClass}>Date of Birth *</Label>
                                <Input type="date" value={formData.dateOfBirth} onChange={(e) => updateFormData("dateOfBirth", e.target.value)} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Gender *</Label>
                                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClass}>Create Password *</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors group-focus-within:text-teal-300" />
                                <Input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={formData.password} onChange={(e) => updateFormData("password", e.target.value)} className={`pl-10 pr-10 ${inputClass}`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClass}>Confirm Password *</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors group-focus-within:text-teal-300" />
                                <Input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={formData.confirmPassword} onChange={(e) => updateFormData("confirmPassword", e.target.value)} className={`pl-10 ${inputClass}`} />
                            </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-sm text-white/80 font-medium">Patient ID: <span className="font-mono text-teal-300">{patientId}</span></p>
                            <p className="text-xs text-white/50 mt-1">This ID will be assigned automatically</p>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-slide-up" key="step-2">
                        <p className="text-sm font-semibold text-teal-300/90">Address Information</p>
                        <div className="space-y-2">
                            <Label className={labelClass}>Street Address *</Label>
                            <Input placeholder="123 Main Street" value={formData.address} onChange={(e) => updateFormData("address", e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className={labelClass}>City *</Label>
                                <Input placeholder="Chennai" value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>PIN Code *</Label>
                                <Input placeholder="600001" value={formData.pincode} onChange={(e) => updateFormData("pincode", e.target.value)} className={inputClass} />
                            </div>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <p className="text-sm font-semibold text-teal-300/90">Emergency Contact</p>
                        <div className="space-y-2">
                            <Label className={labelClass}>Contact Name *</Label>
                            <Input placeholder="Jane Doe" value={formData.emergencyName} onChange={(e) => updateFormData("emergencyName", e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className={labelClass}>Phone *</Label>
                                <Input placeholder="+91 98765 43211" value={formData.emergencyPhone} onChange={(e) => updateFormData("emergencyPhone", e.target.value)} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Relationship</Label>
                                <Select value={formData.emergencyRelationship} onValueChange={(value) => updateFormData("emergencyRelationship", value)}>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="parent">Parent</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 animate-slide-up" key="step-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className={labelClass}>Blood Group *</Label>
                                <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData("bloodGroup", value)}>
                                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Height (cm)</Label>
                                <Input type="number" placeholder="170" value={formData.height} onChange={(e) => updateFormData("height", e.target.value)} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <Label className={labelClass}>Weight (kg)</Label>
                                <Input type="number" placeholder="70" value={formData.weight} onChange={(e) => updateFormData("weight", e.target.value)} className={inputClass} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClass}>Medical Conditions</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {medicalConditionsOptions.map((condition) => (
                                    <div key={condition} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={condition}
                                            checked={formData.medicalConditions.includes(condition)}
                                            onCheckedChange={(checked) => {
                                                if (checked) updateFormData("medicalConditions", [...formData.medicalConditions, condition]);
                                                else updateFormData("medicalConditions", formData.medicalConditions.filter((c) => c !== condition));
                                            }}
                                            className="border-white/30 data-[state=checked]:bg-teal-400 data-[state=checked]:border-teal-400"
                                        />
                                        <Label htmlFor={condition} className="text-sm font-normal text-white/70">{condition}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClass}>Current Medications</Label>
                            <textarea value={formData.currentMedications} onChange={(e) => updateFormData("currentMedications", e.target.value)}
                                className={`w-full min-h-[80px] px-3 py-2 rounded-xl text-sm resize-none bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50`}
                                placeholder="List any medications..." />
                        </div>
                        <div className="space-y-2">
                            <Label className={labelClass}>Allergies</Label>
                            <textarea value={formData.allergies} onChange={(e) => updateFormData("allergies", e.target.value)}
                                className={`w-full min-h-[80px] px-3 py-2 rounded-xl text-sm resize-none bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50`}
                                placeholder="List any allergies..." />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4 animate-slide-up" key="step-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="hasInsurance" checked={formData.hasInsurance}
                                onCheckedChange={(checked) => updateFormData("hasInsurance", checked as boolean)}
                                className="border-white/30 data-[state=checked]:bg-teal-400 data-[state=checked]:border-teal-400" />
                            <Label htmlFor="hasInsurance" className="text-white/90 font-medium">I have health insurance</Label>
                        </div>
                        {formData.hasInsurance && (
                            <div className="space-y-4 pl-4 border-l-2 border-teal-400/30 animate-slide-up">
                                <div className="space-y-2">
                                    <Label className={labelClass}>Insurance Provider</Label>
                                    <Input placeholder="Star Health, ICICI Lombard, etc." value={formData.insuranceProvider} onChange={(e) => updateFormData("insuranceProvider", e.target.value)} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>Policy Number</Label>
                                    <Input placeholder="POL123456789" value={formData.insuranceId} onChange={(e) => updateFormData("insuranceId", e.target.value)} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <Label className={labelClass}>Expiry Date</Label>
                                    <Input type="date" value={formData.insuranceExpiry} onChange={(e) => updateFormData("insuranceExpiry", e.target.value)} className={inputClass} />
                                </div>
                            </div>
                        )}
                        <div className="h-px bg-white/10 my-2" />
                        <div className="space-y-2">
                            <Label className={labelClass}>Your Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <Input type={showPassword ? "text" : "password"} value={formData.password} readOnly className={`pl-10 pr-10 ${inputClass}`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-400/20">
                            <p className="text-sm text-amber-200/90">
                                <strong>Important:</strong> After registration, you&apos;ll be redirected to login. Save your Patient ID and Password for future access.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-8 px-4">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#134e4a] animate-gradient" />

            {/* Floating decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-float-slow" />
                <Heart className="absolute top-[15%] right-[15%] h-6 w-6 text-white/10 animate-float" />
                <Activity className="absolute bottom-[25%] left-[10%] h-8 w-8 text-white/10 animate-float-slow" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-6 animate-slide-up">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-white/20 transition-transform hover:scale-105">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">MediCore</h1>
                        <p className="text-xs text-teal-200/80">Patient Registration</p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="mb-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
                    <div className="flex items-center justify-center gap-2">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${isActive ? "bg-white/20 scale-105" : isCompleted ? "bg-teal-400/20" : "bg-white/5"
                                        }`}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${isActive ? "bg-white text-teal-900" : isCompleted ? "bg-teal-400 text-white" : "bg-white/10 text-white/40"
                                            }`}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={`text-xs font-medium hidden sm:block transition-colors ${isActive ? "text-white" : isCompleted ? "text-teal-300" : "text-white/40"
                                            }`}>{step.name}</span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-8 h-0.5 mx-1 transition-colors duration-500 ${currentStep > step.id ? "bg-teal-400/50" : "bg-white/10"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
                    </div>
                </div>

                {/* Main Card */}
                <div className="animate-scale-in backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl shadow-black/20 overflow-hidden" style={{ animationDelay: "0.2s" }}>
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">
                                Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
                            </h2>
                            <p className="text-sm text-teal-200/60 mt-1">Fill in the required information to proceed</p>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-400/30 text-white">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {renderStep()}

                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={currentStep === 1 ? () => router.push("/login") : handleBack}
                                disabled={isLoading}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-11 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {currentStep === 1 ? "Back to Login" : "Previous"}
                            </Button>

                            {currentStep < steps.length ? (
                                <Button onClick={handleNext} className="bg-white text-teal-900 hover:bg-white/90 font-semibold rounded-xl h-11 shadow-lg transition-all hover:-translate-y-0.5">
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-white text-teal-900 hover:bg-white/90 font-semibold rounded-xl h-11 shadow-lg transition-all hover:-translate-y-0.5"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        "Complete Registration"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-center text-sm text-white/60 mt-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                    Already have an account?{" "}
                    <Link href="/login" className="text-teal-300 hover:text-teal-200 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
