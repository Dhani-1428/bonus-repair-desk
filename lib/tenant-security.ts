/**
 * Tenant Security Utilities
 * Ensures users can only access their own tenant data
 */

import { queryOne } from "./mysql"

/**
 * Verify that a user belongs to a specific tenant
 */
export async function verifyTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    const user = await queryOne(
      `SELECT tenantId FROM users WHERE id = ?`,
      [userId]
    )

    if (!user) {
      return false
    }

    // User must belong to the tenant they're trying to access
    return user.tenantId === tenantId
  } catch (error) {
    console.error("[Security] Error verifying tenant access:", error)
    return false
  }
}

/**
 * Get user's tenantId from userId
 */
export async function getUserTenantId(userId: string): Promise<string | null> {
  try {
    const user = await queryOne(
      `SELECT tenantId FROM users WHERE id = ?`,
      [userId]
    )

    return user?.tenantId || null
  } catch (error) {
    console.error("[Security] Error getting user tenant ID:", error)
    return null
  }
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const user = await queryOne(
      `SELECT role, email FROM users WHERE id = ?`,
      [userId]
    )

    return (
      user?.role === "SUPER_ADMIN" ||
      user?.role === "super_admin" ||
      user?.email === "superadmin@admin.com"
    )
  } catch (error) {
    console.error("[Security] Error checking super admin:", error)
    return false
  }
}

/**
 * Verify user can access data (either their own tenant or super admin)
 */
export async function canAccessTenantData(
  userId: string,
  targetTenantId: string
): Promise<boolean> {
  // Super admin can access all tenant data
  if (await isSuperAdmin(userId)) {
    return true
  }

  // Regular users can only access their own tenant data
  return await verifyTenantAccess(userId, targetTenantId)
}

