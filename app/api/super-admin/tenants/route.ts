import { NextRequest, NextResponse } from "next/server"
import { query, escapeId } from "@/lib/mysql"
import { getAllTenantIds, getTenantTableNames } from "@/lib/tenant-db"

// GET all tenants and their data (super admin only)
export async function GET(request: NextRequest) {
  try {
    // Get all tenant IDs
    const tenantIds = await getAllTenantIds()

    // Get all users with their tenant info
    const users = await query(`
      SELECT id, name, email, shopName, tenantId, createdAt
      FROM users
      WHERE role != 'SUPER_ADMIN'
    `) as any[]

    // Get data for each tenant
    const tenantsData = await Promise.all(
      tenantIds.map(async (tenantId) => {
        try {
          const tables = getTenantTableNames(tenantId)
          const user = users.find((u: any) => u.tenantId === tenantId)

          // Get counts for each table
          const repairTable = escapeId(tables.repairTickets)
          const teamTable = escapeId(tables.teamMembers)
          const [repairCount, teamCount] = await Promise.all([
            query(`SELECT COUNT(*) as count FROM ${repairTable}`) as Promise<any[]>,
            query(`SELECT COUNT(*) as count FROM ${teamTable}`) as Promise<any[]>,
          ])

          return {
            tenantId,
            user: user || null,
            stats: {
              repairTickets: Number(repairCount[0]?.count || 0),
              teamMembers: Number(teamCount[0]?.count || 0),
            },
          }
        } catch (error) {
          console.error(`Error fetching data for tenant ${tenantId}:`, error)
          return {
            tenantId,
            user: users.find((u: any) => u.tenantId === tenantId) || null,
            stats: {
              repairTickets: 0,
              teamMembers: 0,
            },
            error: "Failed to fetch tenant data",
          }
        }
      })
    )

    return NextResponse.json({ tenants: tenantsData })
  } catch (error) {
    console.error("[API] Error fetching tenants:", error)
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    )
  }
}
