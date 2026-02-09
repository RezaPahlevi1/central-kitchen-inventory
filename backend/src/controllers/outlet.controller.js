import pool from "../config/db.js";

export const createOutlet = async (req, res) => {
  const { name, address, is_active = 1 } = req.body;
  let conn;

  try {
    if (!name) {
      return res.status(400).json({ message: "Outlet name wajib diisi" });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query(
      `
      INSERT INTO outlets (name, address, is_active)
      VALUES (?, ?, ?)
      `,
      [name, address || null, is_active],
    );

    await conn.commit();

    res.json({
      message: "Outlet berhasil ditambahkan",
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

// Update getOutlets - filter only active outlets
export const getOutlets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM outlets WHERE is_active = 1 ORDER BY name`,
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch outlets" });
  }
};

// Soft Delete Outlet
export const deleteOutlet = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Check if outlet exists and is active
    const [[outlet]] = await conn.query(
      `SELECT * FROM outlets WHERE id = ? AND is_active = 1`,
      [id],
    );

    if (!outlet) {
      return res.status(404).json({ message: "Outlet tidak ditemukan" });
    }

    // Soft delete outlet
    await conn.query(`UPDATE outlets SET is_active = 0 WHERE id = ?`, [id]);

    // Delete physical stocks (karena outlet sudah tidak ada)
    await conn.query(`DELETE FROM outlet_stocks WHERE outlet_id = ?`, [id]);

    await conn.commit();
    res.json({ message: "Outlet berhasil dihapus" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

export const getOutletStocks = async (req, res) => {
  const { outlet_id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        os.outlet_id,
        p.id AS product_id,
        p.name AS product_name,
        p.unit,
        os.stock,

        MAX(sm.created_at) AS last_update,

        SUBSTRING_INDEX(
          GROUP_CONCAT(sm.direction ORDER BY sm.created_at DESC),
          ',',1
        ) AS last_direction

      FROM outlet_stocks os
      JOIN products p 
        ON p.id = os.product_id

      LEFT JOIN stock_movements sm
        ON sm.product_id = os.product_id
      AND sm.outlet_id = os.outlet_id
      AND sm.direction = 'IN'
      AND sm.movement_type = 'TRANSFER'

      WHERE os.outlet_id = ?
        AND os.stock > 0

      GROUP BY
        os.outlet_id,
        p.id,
        p.name,
        p.unit,
        os.stock

      ORDER BY p.name ASC
      `,
      [outlet_id],
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch outlet stocks",
    });
  }
};
