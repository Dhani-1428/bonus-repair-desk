import { NextRequest, NextResponse } from "next/server"
import { queryOne, execute } from "@/lib/mysql"
import { sendPaymentRejectedEmail } from "@/lib/email-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const token = searchParams.get("token")

    if (!paymentId || !token) {
      return NextResponse.json(
        { error: "Payment ID and token are required" },
        { status: 400 }
      )
    }

    // Verify token
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [id, userId] = decoded.split(':')
      if (id !== paymentId) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      )
    }

    // Fetch payment request
    const payment = await queryOne(
      `SELECT 
        p.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.shopName as user_shopName,
        u.contactNumber as user_contactNumber
       FROM payment_requests p
       LEFT JOIN users u ON p.userId = u.id
       WHERE p.id = ?`,
      [paymentId]
    )

    if (!payment) {
      return NextResponse.json(
        { error: "Payment request not found" },
        { status: 404 }
      )
    }

    if (payment.status !== "PENDING") {
      return NextResponse.redirect(new URL(`/super-admin/payments?message=${encodeURIComponent(`Payment already ${payment.status.toLowerCase()}`)}`, request.url))
    }

    // Decline payment
    await execute(
      `UPDATE payment_requests SET status = 'REJECTED' WHERE id = ?`,
      [paymentId]
    )

    // Send rejection email to user
    try {
      if (payment.user_id) {
        const user = {
          id: payment.user_id,
          name: payment.user_name,
          email: payment.user_email,
          shopName: payment.user_shopName,
          contactNumber: payment.user_contactNumber,
          role: "USER" as const,
          tenantId: payment.tenantId,
          createdAt: new Date().toISOString(),
        }
        await sendPaymentRejectedEmail(user, payment)
      }
    } catch (emailError) {
      console.error("[API] Error sending rejection email:", emailError)
    }

    // Redirect to admin panel with success message
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(new URL(`/super-admin/payments?message=${encodeURIComponent("Payment declined successfully!")}`, baseUrl))
  } catch (error) {
    console.error("[API] Error declining payment:", error)
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(new URL(`/super-admin/payments?error=${encodeURIComponent("Failed to decline payment")}`, baseUrl))
  }
}

