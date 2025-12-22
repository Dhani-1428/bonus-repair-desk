import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/mysql"

// GET subscription history for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const history = await query(
      `SELECT * FROM subscription_history WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    )

    return NextResponse.json({ history })
  } catch (error) {
    console.error("[API] Error fetching subscription history:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription history" },
      { status: 500 }
    )
  }
}
