import { NextRequest, NextResponse } from "next/server"
import { query, queryOne, execute } from "@/lib/mysql"
import { v4 as uuidv4 } from "uuid"

// GET all testimonials (approved ones)
export async function GET(request: NextRequest) {
  try {
    // Check if table exists, if not return empty array
    try {
      const testimonials = await query(
        `SELECT id, name, username, body, img, createdAt, status 
         FROM testimonials 
         WHERE status = 'APPROVED' 
         ORDER BY createdAt DESC 
         LIMIT 50`
      )

      return NextResponse.json({ testimonials: testimonials || [] })
    } catch (tableError: any) {
      // Table doesn't exist yet, return empty array
      if (tableError?.code === 'ER_NO_SUCH_TABLE' || tableError?.message?.includes('doesn\'t exist')) {
        console.log("[API] Testimonials table doesn't exist yet, returning empty array")
        return NextResponse.json({ testimonials: [] })
      }
      throw tableError
    }
  } catch (error) {
    console.error("[API] Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    )
  }
}

// POST create new testimonial/comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, username, body: commentBody, img } = body

    if (!name || !commentBody) {
      return NextResponse.json(
        { error: "Name and comment are required" },
        { status: 400 }
      )
    }

    // Check if table exists, create if not
    try {
      await query(`SELECT 1 FROM testimonials LIMIT 1`)
    } catch (tableError: any) {
      if (tableError?.code === 'ER_NO_SUCH_TABLE' || tableError?.message?.includes('doesn\'t exist')) {
        // Create testimonials table
        await execute(`
          CREATE TABLE IF NOT EXISTS testimonials (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            img VARCHAR(500),
            status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_createdAt (createdAt)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `)
      } else {
        throw tableError
      }
    }

    // Generate username if not provided
    const finalUsername = username || `@${name.toLowerCase().replace(/\s+/g, "_")}`
    
    // Use provided image or generate a placeholder
    const finalImg = img || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=150`

    const testimonialId = uuidv4()

    await execute(
      `INSERT INTO testimonials (id, name, username, body, img, status, createdAt)
       VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())`,
      [testimonialId, name, finalUsername, commentBody, finalImg]
    )

    return NextResponse.json({
      message: "Thank you for your feedback! Your comment will be reviewed and published soon.",
      testimonial: {
        id: testimonialId,
        name,
        username: finalUsername,
        body: commentBody,
        img: finalImg,
        status: "PENDING",
      },
    }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating testimonial:", error)
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    )
  }
}

