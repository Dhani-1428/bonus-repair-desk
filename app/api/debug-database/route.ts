import { NextRequest, NextResponse } from "next/server"
import { query, queryOne, escapeId } from "@/lib/mysql"

/**
 * Comprehensive database diagnostic endpoint
 * Shows all tables, data counts, and sample data
 */
export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      success: true,
      database: {
        name: process.env.DB_NAME || "admin_panel_db",
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || "3306",
        user: process.env.DB_USER || "root",
      },
      tables: [],
      dataSummary: {},
      errors: [],
    }

    // Get current database name
    try {
      const dbResult = await query("SELECT DATABASE() as current_db")
      diagnostics.database.current_db = dbResult[0]?.current_db || "unknown"
    } catch (e: any) {
      diagnostics.errors.push(`Failed to get current database: ${e.message}`)
    }

    // Get all tables in the database
    try {
      const tables = await query("SHOW TABLES")
      const tableNames = tables.map((t: any) => Object.values(t)[0])
      diagnostics.tables = tableNames

      // For each table, get row count and sample data
      for (const tableName of tableNames) {
        try {
          // Get row count (use escapeId for table names)
          const escapedTableName = escapeId(tableName)
          const countResult = await query(`SELECT COUNT(*) as count FROM ${escapedTableName}`)
          const count = countResult[0]?.count || 0

          // Get sample data (first 3 rows)
          let sampleData: any[] = []
          if (count > 0) {
            try {
              sampleData = await query(`SELECT * FROM ${escapedTableName} LIMIT 3`)
            } catch (e: any) {
              sampleData = [{ error: `Failed to fetch sample: ${e.message}` }]
            }
          }

          diagnostics.dataSummary[tableName] = {
            rowCount: count,
            sampleData: sampleData,
          }
        } catch (e: any) {
          diagnostics.dataSummary[tableName] = {
            rowCount: "error",
            error: e.message,
          }
          diagnostics.errors.push(`Error querying table ${tableName}: ${e.message}`)
        }
      }
    } catch (e: any) {
      diagnostics.errors.push(`Failed to list tables: ${e.message}`)
    }

    // Check specific important tables
    const importantTables = [
      "users",
      "subscriptions",
      "payment_requests",
      "login_history",
      "testimonials",
    ]

    diagnostics.importantTables = {}
    for (const tableName of importantTables) {
      if (diagnostics.tables.includes(tableName)) {
        try {
          const escapedTableName = escapeId(tableName)
          const data = await query(`SELECT * FROM ${escapedTableName} LIMIT 10`)
          diagnostics.importantTables[tableName] = {
            exists: true,
            count: data.length,
            data: data,
          }
        } catch (e: any) {
          diagnostics.importantTables[tableName] = {
            exists: true,
            error: e.message,
          }
        }
      } else {
        diagnostics.importantTables[tableName] = {
          exists: false,
          message: "Table does not exist",
        }
      }
    }

    // Check for tenant-specific tables
    try {
      const tenantTables = diagnostics.tables.filter((t: string) =>
        t.includes("tenant_") || t.includes("repair_tickets")
      )
      diagnostics.tenantTables = tenantTables

      // Get sample tenant table data
      if (tenantTables.length > 0) {
        diagnostics.tenantTableData = {}
        for (const tableName of tenantTables.slice(0, 5)) {
          // Only check first 5 tenant tables to avoid too much data
          try {
            const escapedTableName = escapeId(tableName)
            const countResult = await query(`SELECT COUNT(*) as count FROM ${escapedTableName}`)
            diagnostics.tenantTableData[tableName] = {
              count: countResult[0]?.count || 0,
            }
          } catch (e: any) {
            diagnostics.tenantTableData[tableName] = {
              error: e.message,
            }
          }
        }
      }
    } catch (e: any) {
      diagnostics.errors.push(`Error checking tenant tables: ${e.message}`)
    }

    return NextResponse.json(diagnostics, { status: 200 })
  } catch (error: any) {
    console.error("[API] Error in debug-database endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get database diagnostics",
        code: error?.code,
        sqlState: error?.sqlState,
      },
      { status: 500 }
    )
  }
}

