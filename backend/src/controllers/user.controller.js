import pool from "../config/db.js";
import bcrypt from "bcrypt";

// Get all staff (Superadmin only)
export const getAllStaff = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_active, created_at FROM admins WHERE role = 'staff' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data staff" });
  }
};

// Add new staff (Superadmin only)
export const addStaff = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    // Cek email duplicate
    const [existing] = await pool.query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email sudah digunakan" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO admins (name, email, password, role, is_active) VALUES (?, ?, ?, 'staff', 1)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Staff berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambahkan staff" });
  }
};

// Delete staff (Superadmin only)
export const deleteStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM admins WHERE id = ? AND role = 'staff'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Staff tidak ditemukan" });
    }

    res.json({ message: "Staff berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus staff" });
  }
};

// Toggle Active Status (Superadmin only)
export const toggleStaffStatus = async (req, res) => {
  const { id } = req.params;

  try {
    // Get current status
    const [users] = await pool.query(
      "SELECT is_active FROM admins WHERE id = ? AND role = 'staff'",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Staff tidak ditemukan" });
    }

    const newStatus = users[0].is_active === 1 ? 0 : 1;

    await pool.query("UPDATE admins SET is_active = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    res.json({
      message: `Status staff berhasil diubah menjadi ${
        newStatus === 1 ? "Aktif" : "Non-aktif"
      }`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengubah status staff" });
  }
};
