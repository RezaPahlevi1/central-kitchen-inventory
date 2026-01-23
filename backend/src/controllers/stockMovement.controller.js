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

export const getStockMovements = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        sm.id,
        sm.qty,
        sm.direction,
        sm.movement_type,
        sm.note,
        sm.created_at,

        p.id AS product_id,
        p.name AS product_name,
        p.unit,

        o.id AS outlet_id,
        o.name AS outlet_name,

        a.name AS created_by
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN outlets o ON sm.outlet_id = o.id
      JOIN admins a ON sm.created_by = a.id
      ORDER BY sm.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch stock movements",
    });
  }
};
