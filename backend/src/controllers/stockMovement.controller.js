import pool from "../config/db.js";
import { recordStockMovement } from "../../services/stock.service.js";

export const transferStock = async (req, res) => {
  const { product_id, outlet_id, qty, note } = req.body;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [[admin]] = await conn.query(
      `SELECT id FROM admins 
       WHERE role='superadmin' AND is_active=1 
       LIMIT 1`,
    );

    if (!admin) throw new Error("Superadmin not found");

    await recordStockMovement({
      conn,
      product_id,
      outlet_id,
      qty,
      direction: "OUT",
      movement_type: "TRANSFER",
      note,
      admin_id: admin.id,
    });

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
