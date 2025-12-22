import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: "Customers API endpoint",
      note: "Currently handled by frontend localStorage. Ready for backend integration.",
    })
  } catch (error) {
    console.error("[API] Customers GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: "Customer creation endpoint",
      note: "Currently handled by frontend localStorage. Ready for backend integration.",
    })
  } catch (error) {
    console.error("[API] Customers POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

