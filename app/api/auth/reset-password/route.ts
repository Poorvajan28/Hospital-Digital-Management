import { NextResponse } from "next/server";
import { emailService } from "@/lib/email";

// In production, this would connect to a database and send emails
// For demo purposes, we simulate the password reset flow

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Please provide a valid email address" },
                { status: 400 }
            );
        }

        // Check if email exists in our demo users
        const demoUsers = [
            "admin@medicore.com",
            "doctor@medicore.com",
            "nurse@medicore.com",
            "patient@medicore.com"
        ];

        const isRegisteredEmail = demoUsers.some(u => u.toLowerCase() === email.toLowerCase());

        // Generate a unique reset token (in production, store in database)
        const resetToken = Buffer.from(`${email}-${Date.now()}`).toString("base64");

        // For security reasons, we don't reveal whether the email exists or not
        // But in demo mode, we'll show different messages

        if (isRegisteredEmail) {
            // In production, this would:
            // 1. Generate a unique reset token
            // 2. Store the token in the database with expiration
            // 3. Send an email with the reset link

            // Send password reset email
            const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

            console.log("Password reset requested for:", email, "| Email sent:", emailSent);

            return NextResponse.json({
                message: "Password reset link sent successfully",
                emailSent: emailSent,
                demo: true,
                note: emailSent
                    ? "Check your email for the reset link"
                    : "Email service not configured. Check server logs."
            });
        } else {
            // Return success anyway to prevent email enumeration
            // In production, you'd send a "if this email exists, we sent a reset link" message
            return NextResponse.json({
                message: "If an account exists with this email, a reset link has been sent"
            });
        }
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Failed to process password reset request" },
            { status: 500 }
        );
    }
}
