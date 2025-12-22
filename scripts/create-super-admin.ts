/**
 * Script to create a super admin user in the database
 * Run with: npx tsx scripts/create-super-admin.ts
 */

import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    const email = "superadmin@admin.com"
    const password = "superadmin123"
    const name = "Super Admin"

    // Check if super admin already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      console.log("Super admin already exists!")
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create super admin
    // Note: We need to manually set role to ADMIN and handle super_admin logic
    // Since Prisma enum doesn't have super_admin, we'll use ADMIN and check email
    const superAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN, // We'll check email for super_admin in the app
        shopName: "System Administration",
      },
    })

    console.log("Super admin created successfully!")
    console.log("Email:", email)
    console.log("Password:", password)
  } catch (error) {
    console.error("Error creating super admin:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()

