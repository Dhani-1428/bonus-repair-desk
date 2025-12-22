import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Map Prisma roles to app roles
    const mappedUsers = users.map((user) => ({
      ...user,
      role: user.role === "ADMIN" ? "admin" : user.role === "USER" ? "member" : "super_admin",
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

