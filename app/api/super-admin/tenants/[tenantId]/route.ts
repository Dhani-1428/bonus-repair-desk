import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/mysql"
import { getTenantTables } from "@/lib/tenant-db"

// GET all data for a specific tenant (super admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenantId = params.tenantId

    // Get user info
    const user = await queryOne(
      `SELECT id, name, email, shopName, contactNumber, tenantId, createdAt
       FROM users WHERE tenantId = ?`,
      [tenantId]
    )

    if (!user) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      )
    }

    // Get all tenant data
    const tenantData = await getTenantTables(tenantId)

    return NextResponse.json({
      tenantId,
      user,
      data: tenantData,
    })
  } catch (error) {
    console.error("[API] Error fetching tenant data:", error)
    return NextResponse.json(
      { error: "Failed to fetch tenant data" },
      { status: 500 }
    )
  }
}
