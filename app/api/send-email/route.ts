import { NextRequest, NextResponse } from "next/server"

/**
 * Email notification API endpoint
 * Uses Gmail SMTP to send emails
 */

const FROM_EMAIL = "bonusrepairdesk@gmail.com"
const ADMIN_EMAIL = "bonusrepairdesk@gmail.com"
const GMAIL_APP_PASSWORD = "afwm ammi rlmg kclv"

// Create transporter function using dynamic import
async function createTransporter() {
  // Use dynamic import to avoid build-time issues with Next.js/Turbopack
  const nodemailerModule = await import("nodemailer")
  const nodemailer = nodemailerModule.default || nodemailerModule
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: FROM_EMAIL,
      pass: GMAIL_APP_PASSWORD.replace(/\s/g, ""), // Remove spaces from app password
    },
  })
  return transporter
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, from, subject, html, text, user, subscription } = body
    const senderEmail = from || FROM_EMAIL
    const recipientEmail = to || ADMIN_EMAIL

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      )
    }

    if (!subject) {
      return NextResponse.json(
        { error: "Email subject is required" },
        { status: 400 }
      )
    }

    // Send email using Gmail SMTP
    const transporter = await createTransporter()
    
    // Extract reply-to and sender name from body if provided
    const replyToEmail = body.replyTo || senderEmail
    const displayName = body.senderName || "Bonus Repair Desk"
    
    // Format the "from" field - use sender's email with their name if provided
    // This makes the email appear to come from the user's email address
    const fromField = senderEmail !== FROM_EMAIL 
      ? `${displayName} <${senderEmail}>`
      : `Bonus Repair Desk <${FROM_EMAIL}>`
    
    const mailOptions: any = {
      from: fromField,
      to: recipientEmail,
      subject: subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, ""), // Strip HTML if no text version
    }
    
    // Set replyTo to the sender's email so replies go to them
    if (replyToEmail && replyToEmail !== FROM_EMAIL) {
      mailOptions.replyTo = replyToEmail
    }

    const info = await transporter.sendMail(mailOptions)

    console.log("📧 Email sent successfully:", {
      messageId: info.messageId,
      from: senderEmail,
      to: recipientEmail,
      subject,
      timestamp: new Date().toISOString(),
    })

    // Store notification for tracking
    const notification = {
      id: `email_${Date.now()}`,
      messageId: info.messageId,
      to: recipientEmail,
      subject,
      user,
      subscription,
      sentAt: new Date().toISOString(),
      status: "sent",
    }

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
      notification,
    })
  } catch (error: any) {
    console.error("[API] Send email error:", error)
    
    // Provide more detailed error information
    const errorMessage = error.message || "Failed to send email notification"
    const errorCode = error.code || "UNKNOWN_ERROR"
    
    return NextResponse.json(
      { 
        error: "Failed to send email notification",
        details: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    )
  }
}

