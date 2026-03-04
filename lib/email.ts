// Email service using SendGrid
// Configure SMTP in .env.local

interface EmailOptions {
  to: string
  subject: string
  html: string
}

class EmailService {
  private static instance: EmailService
  private isConfigured: boolean = false

  private constructor() {
    // Check if SendGrid is configured
    this.isConfigured = !!(
      process.env.SENDGRID_API_KEY &&
      process.env.SENDGRID_FROM_EMAIL
    )

    if (!this.isConfigured) {
      console.warn("⚠️  Email service not configured. Emails will be logged only.")
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  public async send(options: EmailOptions): Promise<boolean> {
    const { to, subject, html } = options

    // Log email content for debugging
    console.log("📧 Sending email:")
    console.log(`   To: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   HTML: ${html.substring(0, 100)}...`)

    if (!this.isConfigured) {
      // In development, just log the email
      console.log("📧 Email (not sent - SendGrid not configured):", {
        to,
        subject,
        preview: html.substring(0, 200),
      })
      return true // Return true to not break the flow
    }

    try {
      // Using require to avoid ESM issues with SendGrid
      const sgMail = require("@sendgrid/mail")

      sgMail.setApiKey(process.env.SENDGRID_API_KEY)

      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        html,
      }

      await sgMail.send(msg)

      console.log("✅ Email sent successfully via SendGrid")
      return true
    } catch (error) {
      console.error("❌ SendGrid email error:", error)
      return false
    }
  }

  public async sendPasswordResetEmail(
    to: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">MediCore Hospital</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hello,</p>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #9ca3af; font-size: 12px;">
              MediCore Hospital Management System<br>
              Secure • Efficient • Reliable
            </p>
          </div>
        </body>
      </html>
    `

    return this.send({
      to,
      subject: "MediCore - Password Reset Request",
      html,
    })
  }

  public async sendWelcomeEmail(
    to: string,
    firstName: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">MediCore Hospital</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Welcome!</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hello ${firstName},</p>
            
            <p>Welcome to MediCore Hospital Management System!</p>
            
            <p>Your account has been created successfully. You can now:</p>
            <ul>
              <li>Book appointments with our doctors</li>
              <li>View your medical records</li>
              <li>Access your health information</li>
              <li>And much more...</li>
            </ul>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #9ca3af; font-size: 12px;">
              MediCore Hospital Management System<br>
              Secure • Efficient • Reliable
            </p>
          </div>
        </body>
      </html>
    `

    return this.send({
      to,
      subject: "Welcome to MediCore Hospital!",
      html,
    })
  }

  public async sendAppointmentConfirmation(
    to: string,
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">MediCore Hospital</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Appointment Confirmed</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hello ${patientName},</p>
            
            <p>Your appointment has been confirmed!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Doctor:</strong> ${doctorName}</p>
              <p style="margin: 10px 0 0 0;"><strong>Date:</strong> ${appointmentDate}</p>
              <p style="margin: 10px 0 0 0;"><strong>Time:</strong> ${appointmentTime}</p>
            </div>
            
            <p>Please arrive 15 minutes before your scheduled time and bring any relevant medical documents.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #9ca3af; font-size: 12px;">
              MediCore Hospital Management System<br>
              Secure • Efficient • Reliable
            </p>
          </div>
        </body>
      </html>
    `

    return this.send({
      to,
      subject: "MediCore - Appointment Confirmation",
      html,
    })
  }
}

export const emailService = EmailService.getInstance()
