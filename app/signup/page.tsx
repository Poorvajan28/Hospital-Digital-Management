"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Lock, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

// Generate a random patient ID
const generatePatientId = () => {
    const prefix = "PT";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
};

// Generate a secure random password
const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

const steps = [
    { id: 1, name: "Personal Information", description: "Basic demographics" },
    { id: 2, name: "Contact Details", description: "Address & emergency contact" },
    { id: 3, name: "Medical History", description: "Health information" },
    { id: 4, name: "Insurance", description: "Insurance details" },
];

export default function SignupPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [patientId] = useState(generatePatientId());

    // Personal Information
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        password: generateSecurePassword(),

        // Contact Details
        address: "",
        city: "",
        state: "Tamil Nadu",
        pincode: "",
        country: "India",

        // Emergency Contact
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelationship: "",

        // Medical History
        bloodGroup: "",
        height: "",
        weight: "",
        medicalConditions: [] as string[],
        currentMedications: "",
        allergies: "",

        // Insurance
        hasInsurance: false,
        insuranceProvider: "",
        insuranceId: "",
        insuranceExpiry: "",
    });

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.gender) {
                    setError("Please fill in all required fields");
                    return false;
                }
                if (!formData.email.includes("@")) {
                    setError("Please enter a valid email address");
                    return false;
                }
                if (formData.phone.length < 10) {
                    setError("Please enter a valid phone number");
                    return false;
                }
                break;
            case 2:
                if (!formData.address || !formData.city || !formData.pincode) {
                    setError("Please fill in all required address fields");
                    return false;
                }
                if (!formData.emergencyName || !formData.emergencyPhone) {
                    setError("Please provide emergency contact information");
                    return false;
                }
                break;
            case 3:
                if (!formData.bloodGroup) {
                    setError("Please select your blood group");
                    return false;
                }
                break;
            case 4:
                if (formData.hasInsurance && (!formData.insuranceProvider || !formData.insuranceId)) {
                    setError("Please provide insurance details or uncheck the insurance option");
                    return false;
                }
                break;
        }
        setError("");
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        setError("");
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setIsLoading(true);
        setError("");

        try {
            // Register the patient
            const response = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_id: patientId,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    date_of_birth: formData.dateOfBirth,
                    gender: formData.gender,
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
                    status: "active",
                    role: "patient",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Registration failed");
            }

            // Show success and redirect to login
            alert(`Registration successful!\n\nYour Patient ID: ${patientId}\nYour Password: ${formData.password}\n\nPlease save these credentials for future login.`);
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
        "Diabetes",
        "Hypertension",
        "Heart Disease",
        "Asthma",
        "Cancer",
        "Kidney Disease",
        "Liver Disease",
        "Thyroid Disorder",
        "None",
    ];

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => updateFormData("firstName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => updateFormData("lastName", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john.doe@email.com"
                                    className="pl-10"
                                    value={formData.email}
                                    onChange={(e) => updateFormData("email", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={(e) => updateFormData("phone", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900 font-medium">Your Patient ID: <span className="font-mono">{patientId}</span></p>
                            <p className="text-xs text-blue-700 mt-1">This ID will be assigned automatically</p>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Address Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address *</Label>
                            <Input
                                id="address"
                                placeholder="123 Main Street"
                                value={formData.address}
                                onChange={(e) => updateFormData("address", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    placeholder="Chennai"
                                    value={formData.city}
                                    onChange={(e) => updateFormData("city", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">PIN Code *</Label>
                                <Input
                                    id="pincode"
                                    placeholder="600001"
                                    value={formData.pincode}
                                    onChange={(e) => updateFormData("pincode", e.target.value)}
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <h3 className="font-semibold text-gray-900">Emergency Contact</h3>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyName">Contact Name *</Label>
                            <Input
                                id="emergencyName"
                                placeholder="Jane Doe"
                                value={formData.emergencyName}
                                onChange={(e) => updateFormData("emergencyName", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyPhone">Phone *</Label>
                                <Input
                                    id="emergencyPhone"
                                    placeholder="+91 98765 43211"
                                    value={formData.emergencyPhone}
                                    onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyRelationship">Relationship</Label>
                                <Select value={formData.emergencyRelationship} onValueChange={(value) => updateFormData("emergencyRelationship", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bloodGroup">Blood Group *</Label>
                                <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData("bloodGroup", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    placeholder="170"
                                    value={formData.height}
                                    onChange={(e) => updateFormData("height", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder="70"
                                    value={formData.weight}
                                    onChange={(e) => updateFormData("weight", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Medical Conditions</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {medicalConditionsOptions.map((condition) => (
                                    <div key={condition} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={condition}
                                            checked={formData.medicalConditions.includes(condition)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    updateFormData("medicalConditions", [...formData.medicalConditions, condition]);
                                                } else {
                                                    updateFormData("medicalConditions", formData.medicalConditions.filter((c) => c !== condition));
                                                }
                                            }}
                                        />
                                        <Label htmlFor={condition} className="text-sm font-normal">{condition}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currentMedications">Current Medications</Label>
                            <textarea
                                id="currentMedications"
                                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                                placeholder="List any medications you are currently taking..."
                                value={formData.currentMedications}
                                onChange={(e) => updateFormData("currentMedications", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="allergies">Allergies</Label>
                            <textarea
                                id="allergies"
                                className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm"
                                placeholder="List any allergies you have..."
                                value={formData.allergies}
                                onChange={(e) => updateFormData("allergies", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasInsurance"
                                checked={formData.hasInsurance}
                                onCheckedChange={(checked) => updateFormData("hasInsurance", checked as boolean)}
                            />
                            <Label htmlFor="hasInsurance" className="font-medium">I have health insurance</Label>
                        </div>

                        {formData.hasInsurance && (
                            <div className="space-y-4 pl-6 border-l-2 border-teal-200">
                                <div className="space-y-2">
                                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                                    <Input
                                        id="insuranceProvider"
                                        placeholder="Star Health, ICICI Lombard, etc."
                                        value={formData.insuranceProvider}
                                        onChange={(e) => updateFormData("insuranceProvider", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="insuranceId">Policy Number</Label>
                                    <Input
                                        id="insuranceId"
                                        placeholder="POL123456789"
                                        value={formData.insuranceId}
                                        onChange={(e) => updateFormData("insuranceId", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="insuranceExpiry">Expiry Date</Label>
                                    <Input
                                        id="insuranceExpiry"
                                        type="date"
                                        value={formData.insuranceExpiry}
                                        onChange={(e) => updateFormData("insuranceExpiry", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <Separator className="my-4" />

                        <div className="space-y-2">
                            <Label>Generated Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    readOnly
                                    className="pl-10 pr-10 bg-gray-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">This secure password has been generated for you. Please save it!</p>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Important:</strong> After registration, you will be redirected to the login page.
                                Please save your Patient ID and Password for future access.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-teal-900">MediCore</span>
                </div>

                {/* Step Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.id
                                            ? "bg-teal-600 text-white"
                                            : "bg-gray-200 text-gray-500"
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <div className="ml-2 hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                                    <p className="text-xs text-gray-500">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 ${currentStep > step.id ? "bg-teal-600" : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Patient Registration</CardTitle>
                        <CardDescription>
                            Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {renderStep()}

                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={currentStep === 1 ? () => router.push("/login") : handleBack}
                                disabled={isLoading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                {currentStep === 1 ? "Back to Login" : "Previous"}
                            </Button>

                            {currentStep < steps.length ? (
                                <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700">
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-teal-600 hover:bg-teal-700"
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
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="text-teal-600 hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
