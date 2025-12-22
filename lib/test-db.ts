import { query } from "./mysql"

export async function testDatabaseConnection() {
  try {
    // Test connection by running a simple query
    const result = await query("SELECT 1 as test")
    console.log("✅ Database connection successful!")
    
    // Try to count users to verify the connection works
    const users = await query("SELECT COUNT(*) as count FROM users")
    const userCount = users[0]?.count || 0
    console.log(`✅ Database is accessible. Current users: ${userCount}`)
    
    return { success: true, userCount }
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

