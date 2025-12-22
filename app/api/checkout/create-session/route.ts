import { NextRequest, NextResponse } from "next/server"
import { PLAN_PRICING, type SubscriptionPlan } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan } = body

    if (!plan || !["THREE_MONTH", "SIX_MONTH", "TWELVE_MONTH"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const planDetails = PLAN_PRICING[plan as SubscriptionPlan]
    if (!planDetails) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // In a real application, you would integrate with Stripe/PayPal here
    // For now, we'll return a success response that the frontend can handle
    // The actual subscription creation happens in the frontend via subscribe-button.tsx

    return NextResponse.json({
      success: true,
      plan,
      price: planDetails.price,
      message: "Subscription session created successfully",
    })
  } catch (error) {
    console.error("[API] Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

