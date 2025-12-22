import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/mysql"

// GET all subscriptions with user data
export async function GET(request: NextRequest) {
  try {
    const subscriptions = await query(`
      SELECT 
        s.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.shopName as user_shopName,
        u.contactNumber as user_contactNumber
      FROM subscriptions s
      LEFT JOIN users u ON s.userId = u.id
      ORDER BY s.createdAt DESC
    `)

    // Transform results to match expected format
    const formatted = (subscriptions as any[]).map((sub) => ({
      ...sub,
      user: {
        id: sub.user_id,
        name: sub.user_name,
        email: sub.user_email,
        shopName: sub.user_shopName,
        contactNumber: sub.user_contactNumber,
      },
    }))

    return NextResponse.json({ subscriptions: formatted })
  } catch (error) {
    console.error("[API] Error fetching all subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    )
  }
}
