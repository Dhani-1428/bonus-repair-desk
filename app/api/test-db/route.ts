import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/test-db"

export async function GET() {
  try {
    const result = await testDatabaseConnection()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Database connection successful",
        userCount: result.userCount,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

