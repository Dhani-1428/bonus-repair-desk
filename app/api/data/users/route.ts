import { NextResponse } from "next/server"
import { query } from "@/lib/mysql"

export async function GET() {
  try {
    const users = await query(
      `SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC`
    )

    // Map database roles to app roles
    const mappedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === "ADMIN" ? "admin" : user.role === "USER" ? "member" : "super_admin",
      createdAt: user.createdAt,
    }))

    return NextResponse.json({ users: mappedUsers })
  } catch (error) {
    console.error("[API] Get users error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

