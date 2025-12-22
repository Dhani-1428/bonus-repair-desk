import { NextRequest, NextResponse } from "next/server"
import { query, queryOne, execute } from "@/lib/mysql"
import bcrypt from "bcryptjs"
import { createTenantTables } from "@/lib/tenant-db"
import { v4 as uuidv4 } from "uuid"
import { sendAdminSignupNotification } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, shopName, contactNumber, selectedPlan } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await queryOne(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate IDs
    const userId = uuidv4()
    const tenantId = uuidv4()

    // Create user
    await execute(
      `INSERT INTO users (id, name, email, password, shopName, contactNumber, role, tenantId)
       VALUES (?, ?, ?, ?, ?, ?, 'USER', ?)`,
      [userId, name, email, hashedPassword, shopName || null, contactNumber || null, tenantId]
    )

    // Get created user
    const user = await queryOne(
      `SELECT id, name, email, role, shopName, contactNumber, tenantId, createdAt 
       FROM users WHERE id = ?`,
      [userId]
    )

    // Create tenant-specific tables for this user
    try {
      console.log(`[API] Creating tenant tables for tenantId: ${tenantId}`)
      await createTenantTables(tenantId)
      console.log(`[API] ✅ Tenant tables created successfully for user: ${email}`)
      
      // Verify tables were created
      const { tenantTablesExist } = await import("@/lib/tenant-db")
      const tablesExist = await tenantTablesExist(tenantId)
      if (tablesExist) {
        console.log(`[API] ✅ Verified: Tenant tables exist for ${email}`)
      } else {
        console.warn(`[API] ⚠️  Warning: Tenant tables verification failed for ${email}`)
      }
    } catch (error: any) {
      console.error("[API] Error creating tenant tables:", error?.message || error)
      // Don't fail registration - tables will be created on first use
      console.log("[API] Tables will be created automatically when user first creates data")
    }

    // Create free 15-day trial subscription
    // Calculate dates with proper timezone handling
    const subscriptionId = uuidv4()
    const startDate = new Date()
    // Normalize to start of day in local timezone to avoid timezone issues
    startDate.setHours(0, 0, 0, 0)
    startDate.setMinutes(0, 0, 0)
    startDate.setSeconds(0, 0)
    startDate.setMilliseconds(0)
    
    // Calculate end date: startDate + exactly 15 days
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 15) // Exactly 15 days free trial
    endDate.setHours(23, 59, 59, 999) // End of day (23:59:59.999)
    
    // Validate: endDate should be exactly 15 days after startDate
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff !== 15) {
      console.error(`[API] Warning: Trial end date calculation error. Expected 15 days, got ${daysDiff} days. Recalculating...`)
      // Recalculate to ensure correctness
      endDate.setTime(startDate.getTime())
      endDate.setDate(endDate.getDate() + 15)
      endDate.setHours(23, 59, 59, 999)
    }

    await execute(
      `INSERT INTO subscriptions (id, userId, tenantId, plan, status, startDate, endDate, isFreeTrial)
       VALUES (?, ?, ?, ?, 'FREE_TRIAL', ?, ?, TRUE)`,
      [subscriptionId, userId, tenantId, selectedPlan || "MONTHLY", startDate, endDate]
    )

    // Send admin notification about new signup (include password for admin reference)
    try {
      await sendAdminSignupNotification(user, password, selectedPlan || "MONTHLY")
    } catch (emailError) {
      console.error("[API] Error sending admin signup notification:", emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: "User registered successfully",
      user,
    }, { status: 201 })
  } catch (error) {
    console.error("[API] Register error:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
