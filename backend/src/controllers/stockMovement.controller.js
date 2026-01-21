import pool from "../config/db.js";

export const transferStock = async (req, res) => {
  const { product_id, outlet_id, qty, note } = req.body;

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // ambil superadmin (sementara, tanpa auth)
    const [[admin]] = await conn.query(
      `SELECT id FROM admins 
       WHERE role = 'superadmin' AND is_active = 1 
       LIMIT 1`,
    );

    if (!admin) {
      throw new Error("Superadmin not found");
    }

    // lock product
    const [[product]] = await conn.query(
      `SELECT stock FROM products WHERE id = ? FOR UPDATE`,
      [product_id],
    );

    if (!product) {
      throw new Error("Product tidak ditemukan");
    }

    if (product.stock < qty) {
      throw new Error("Stok tidak mencukupi");
    }

    // kurangi stok central kitchen
    await conn.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [
      qty,
      product_id,
    ]);

    // insert stock movement
    await conn.query(
      `INSERT INTO stock_movements
       (product_id, outlet_id, qty, direction, movement_type, note, created_by)
       VALUES (?, ?, ?, 'OUT', 'TRANSFER', ?, ?)`,
      [product_id, outlet_id, qty, note, admin.id],
    );

    await conn.commit();
    res.json({ message: "Stock berhasil ditransfer" });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
