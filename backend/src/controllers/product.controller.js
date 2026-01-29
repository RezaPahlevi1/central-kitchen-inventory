import pool from "../config/db.js";
import { recordStockMovement } from "../../services/stock.service.js";

/**
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  const { name, unit, min_stock, stock, category_id } = req.body;

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [[admin]] = await conn.query(
      `SELECT id FROM admins 
       WHERE role='superadmin' AND is_active=1 LIMIT 1`,
    );

    if (!admin) throw new Error("Superadmin not found");

    const [result] = await conn.query(
      `INSERT INTO products 
       (name, unit, min_stock, stock, category_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, unit, min_stock || 0, 0, category_id, admin.id],
    );

    const product_id = result.insertId;

    // LOG STOCK MASUK
    if (stock > 0) {
      await recordStockMovement({
        conn,
        product_id,
        qty: stock,
        direction: "IN",
        movement_type: "INITIAL",
        admin_id: admin.id,
        note: "Initial stock",
      });
    }

    await conn.commit();

    res.status(201).json({
      message: "Product created",
      product_id,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

/**
 * GET /api/products
 */
// export const getProducts = async (req, res) => {
//   try {
//     const [rows] = await pool.query(`
//       SELECT
//         p.id,
//         p.name,
//         p.unit,
//         p.stock,
//         p.min_stock,
//         (p.stock <= p.min_stock) AS is_low_stock,
//         c.name AS category,
//         a.name AS created_by,
//         p.created_at
//       FROM products p
//       JOIN categories c ON p.category_id = c.id
//       JOIN admins a ON p.created_by = a.id
//       ORDER BY p.created_at DESC
//     `);

//     res.json(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch products" });
//   }
// };
export const getProducts = async (req, res) => {
  const { search } = req.query;

  try {
    let sql = `
      SELECT
        p.id,
        p.name,
        p.unit,
        p.stock,
        p.min_stock,
        (p.stock <= p.min_stock) AS is_low_stock,
        c.name AS category,
        a.name AS created_by,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN admins a ON p.created_by = a.id
    `;

    const params = [];

    if (search) {
      sql += ` WHERE p.name LIKE ? `;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY p.created_at DESC`;

    const [rows] = await pool.query(sql, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, unit, min_stock, stock, category_id } = req.body;

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [[admin]] = await conn.query(
      `SELECT id FROM admins 
       WHERE role='superadmin' AND is_active=1 LIMIT 1`,
    );

    const [[oldProduct]] = await conn.query(
      `SELECT stock FROM products WHERE id=? FOR UPDATE`,
      [id],
    );

    if (!oldProduct) throw new Error("Product not found");

    await conn.query(
      `UPDATE products 
   SET 
     name=?, 
     unit=?, 
     min_stock=?, 
     category_id=COALESCE(?, category_id)
   WHERE id=?`,
      [name, unit, min_stock || 0, category_id || null, id],
    );

    const diff = stock - oldProduct.stock;

    if (diff !== 0) {
      await recordStockMovement({
        conn,
        product_id: id,
        qty: Math.abs(diff),
        direction: diff > 0 ? "IN" : "OUT",
        movement_type: "ADJUSTMENT",
        admin_id: admin.id,
        note: "Manual stock adjustment",
      });
    }

    await conn.commit();
    res.json({ message: "Product updated" });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
};

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [[admin]] = await conn.query(
      `SELECT id FROM admins 
       WHERE role='superadmin' AND is_active=1 LIMIT 1`,
    );

    const [[product]] = await conn.query(
      `SELECT stock FROM products WHERE id=? FOR UPDATE`,
      [id],
    );

    if (!product) throw new Error("Product not found");

    if (product.stock > 0) {
      await recordStockMovement({
        conn,
        product_id: id,
        qty: product.stock,
        direction: "OUT",
        movement_type: "WASTE",
        admin_id: admin.id,
        note: "Product deleted",
      });
    }

    await conn.query(`DELETE FROM products WHERE id=?`, [id]);

    await conn.commit();
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    if (conn) await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
