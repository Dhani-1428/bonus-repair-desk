import { NextRequest, NextResponse } from "next/server"
import { query, queryOne, execute, escapeId } from "@/lib/mysql"
import { getTenantTableNames, tenantTablesExist, createTenantTables } from "@/lib/tenant-db"
import { getUserTenantId, canAccessTenantData } from "@/lib/tenant-security"

// GET team members for a user (tenant-specific)
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

    // Get user to find tenantId
    const user = await queryOne(
      `SELECT tenantId FROM users WHERE id = ?`,
      [userId]
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Security check: Verify user can access their own tenant data
    const requestingUserTenantId = await getUserTenantId(userId)
    if (!requestingUserTenantId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Users can only access their own tenant data (unless super admin)
    if (requestingUserTenantId !== user.tenantId) {
      const hasAccess = await canAccessTenantData(userId, user.tenantId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: "Access denied: You can only access your own tenant data" },
          { status: 403 }
        )
      }
    }

    // Ensure tenant tables exist
    if (!(await tenantTablesExist(user.tenantId))) {
      await createTenantTables(user.tenantId)
    }

    const tables = getTenantTableNames(user.tenantId)
    const tableName = escapeId(tables.teamMembers)
    const members = await query(
      `SELECT * FROM ${tableName} WHERE userId = ? ORDER BY createdAt DESC`,
      [userId]
    )

    return NextResponse.json({ members })
  } catch (error) {
    console.error("[API] Error fetching team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

// POST create team member (tenant-specific) or update if action=update
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const id = searchParams.get("id")

    // Handle update action
    if (action === "update" && id) {
      const body = await request.json()
      const { userId, name, email, role } = body

      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        )
      }

      // Get user to find tenantId
      const user = await queryOne(
        `SELECT tenantId FROM users WHERE id = ?`,
        [userId]
      )

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }

      const tables = getTenantTableNames(user.tenantId)
      const tableName = escapeId(tables.teamMembers)

      // Build update query dynamically
      const updateFields: string[] = []
      const updateValues: any[] = []

      if (name !== undefined) {
        updateFields.push("name = ?")
        updateValues.push(name)
      }
      if (email !== undefined) {
        updateFields.push("email = ?")
        updateValues.push(email)
      }
      if (role !== undefined) {
        updateFields.push("role = ?")
        updateValues.push(role)
      }

      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: "No fields to update" },
          { status: 400 }
        )
      }

      updateValues.push(id)

      await execute(
        `UPDATE ${tableName} SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      )

      // Fetch updated member
      const member = await queryOne(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [id]
      )

      return NextResponse.json({ member })
    }

    // Handle create action
    const body = await request.json()
    const { userId, name, email, role } = body

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: "User ID, name, and email are required" },
        { status: 400 }
      )
    }

    // Get user to find tenantId
    const user = await queryOne(
      `SELECT tenantId FROM users WHERE id = ?`,
      [userId]
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Ensure tenant tables exist
    if (!(await tenantTablesExist(user.tenantId))) {
      console.log(`[API] Creating tenant tables for tenantId: ${user.tenantId}`)
      await createTenantTables(user.tenantId)
      console.log(`[API] ✅ Tenant tables created for user: ${userId}`)
    }

    const tables = getTenantTableNames(user.tenantId)
    const tableName = escapeId(tables.teamMembers)
    console.log(`[API] Saving team member to tenant table: ${tables.teamMembers} for tenantId: ${user.tenantId}`)
    const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await execute(
      `INSERT INTO ${tableName} (id, userId, name, email, role) VALUES (?, ?, ?, ?, ?)`,
      [memberId, userId, name, email, role || "member"]
    )

    // Fetch created member
    const member = await queryOne(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [memberId]
    )
    
    console.log(`[API] ✅ Team member saved successfully to tenant table: ${tables.teamMembers}`)
    console.log(`[API] Member ID: ${memberId}, Name: ${name}, Tenant: ${user.tenantId}`)

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating/updating team member:", error)
    return NextResponse.json(
      { error: "Failed to create/update team member" },
      { status: 500 }
    )
  }
}

// DELETE team member (tenant-specific)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Member ID and User ID are required" },
        { status: 400 }
      )
    }

    // Get user to find tenantId
    const user = await queryOne(
      `SELECT tenantId FROM users WHERE id = ?`,
      [userId]
    )

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const tables = getTenantTableNames(user.tenantId)
    const membersTable = escapeId(tables.teamMembers)
    const deletedTable = escapeId(tables.deletedMembers)

    // Move to deleted members before deleting
    const member = await queryOne(
      `SELECT * FROM ${membersTable} WHERE id = ?`,
      [id]
    )

    if (member) {
      await execute(
        `INSERT INTO ${deletedTable} (id, userId, name, email, role) VALUES (?, ?, ?, ?, ?)`,
        [member.id, member.userId, member.name, member.email, member.role]
      )
    }

    await execute(
      `DELETE FROM ${membersTable} WHERE id = ?`,
      [id]
    )

    return NextResponse.json({ message: "Team member deleted successfully" })
  } catch (error) {
    console.error("[API] Error deleting team member:", error)
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    )
  }
}
