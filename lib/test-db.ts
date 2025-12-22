import { prisma } from "./prisma"

export async function testDatabaseConnection() {
  try {
    // Test connection by running a simple query
    await prisma.$connect()
    console.log("✅ Database connection successful!")
    
    // Try to count users to verify the connection works
    const userCount = await prisma.user.count()
    console.log(`✅ Database is accessible. Current users: ${userCount}`)
    
    return { success: true, userCount }
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  } finally {
    await prisma.$disconnect()
  }
}

