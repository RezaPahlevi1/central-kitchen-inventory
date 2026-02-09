import pool from "../src/config/db.js";
import bcrypt from "bcrypt";

const initAuth = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("Connected to DB");

    // 1. Check existing columns in admins
    const [columns] = await conn.query("SHOW COLUMNS FROM admins");
    const columnNames = columns.map((c) => c.Field);

    // 2. Add password column if missing
    if (!columnNames.includes("password")) {
      console.log("Adding password column...");
      await conn.query(
        "ALTER TABLE admins ADD COLUMN password VARCHAR(255) NULL AFTER name",
      );
    }

    // 3. Add username column if missing
    if (!columnNames.includes("username")) {
      console.log("Adding username column...");
      await conn.query(
        "ALTER TABLE admins ADD COLUMN username VARCHAR(50) UNIQUE NULL AFTER id",
      );
    }

    // 4. Update existing rows to have a default password/username if empty
    // (Optional: mainly for the existing superadmin)
    // We'll just create a new specific superadmin if not exists
    const [existingAdmin] = await conn.query(
      "SELECT * FROM admins WHERE role='superadmin' LIMIT 1",
    );

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    if (existingAdmin.length === 0) {
      console.log("Creating default superadmin...");
      await conn.query(
        `INSERT INTO admins (name, username, password, role, is_active)
         VALUES (?, ?, ?, 'superadmin', 1)`,
        ["Super Admin", "admin", hashedPassword],
      );
    } else {
      console.log("Superadmin exists. Updating credentials for safety...");
      // Ensure the existing admin has a username and password
      const admin = existingAdmin[0];
      if (!admin.password || !admin.username) {
        await conn.query(
          "UPDATE admins SET password = ?, username = ? WHERE id = ?",
          [hashedPassword, "admin", admin.id],
        );
        console.log(
          "Updated existing superadmin with default credentials (admin/admin123)",
        );
      }
    }

    console.log("Auth setup complete!");
  } catch (error) {
    console.error("Setup failed:", error);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
};

initAuth();
