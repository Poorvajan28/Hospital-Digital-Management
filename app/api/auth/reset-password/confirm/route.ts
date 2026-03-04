import { NextResponse } from "next/server";

// In production, this would connect to a database and update the password
// For demo purposes, we simulate the password reset confirmation

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and new password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // In production, this would:
        // 1. Validate the token from the database
        // 2. Check if the token has expired
        // 3. Update the user's password (hashed)
        // 4. Delete the used token from the database

        // For demo purposes, we'll return success
        return NextResponse.json({
            message: "Password reset successful",
            demo: true,
            note: "In production, the password would be updated in the database"
        });
    } catch (error) {
        console.error("Password reset confirmation error:", error);
        return NextResponse.json(
            { error: "Failed to reset password" },
            { status: 500 }
        );
    }
}
