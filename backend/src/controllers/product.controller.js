import pool from "../config/db.js";
import { recordStockMovement } from "../../services/stock.service.js";

export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.unit,
        p.stock,
        p.min_stock,
        p.category_id,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock > 0
      ORDER BY p.name ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const createProduct = async (req, res) => {
  const { name, unit, min_stock, stock, category_id } = req.body;

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO products 
       (name, unit, min_stock, stock, category_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, unit, min_stock || 0, 0, category_id, req.user.id],
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
        admin_id: req.user.id,
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

export const getProducts = async (req, res) => {
  const { search, page = 1 } = req.query;
  const limit = 10;
  const offset = (parseInt(page) - 1) * limit;

  try {
    let sql = `
      SELECT
        p.id,
        p.name,
        p.unit,
        p.stock,
        p.min_stock,
        (p.stock <= p.min_stock) AS is_low_stock,
        p.category_id,
        c.name AS category,
        a.name AS created_by,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN admins a ON p.created_by = a.id
    `;

    const params = [];

    if (search) {
      sql += ` WHERE p.name LIKE ? `;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);

    // COUNT TOTAL
    let countSql = `
      SELECT COUNT(*) AS total
      FROM products p
    `;

    const countParams = [];

    if (search) {
      countSql += ` WHERE p.name LIKE ? `;
      countParams.push(`%${search}%`);
    }

    const [[count]] = await pool.query(countSql, countParams);

    res.json({
      data: rows,
      totalPages: Math.ceil(count.total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, unit, min_stock, stock, category_id } = req.body;

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

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
        admin_id: req.user.id,
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
    if (!admin) throw new Error("Superadmin not found");

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

    // Hapus child records dulu (foreign key constraint)
    await conn.query(`DELETE FROM stock_movements WHERE product_id=?`, [id]);
    await conn.query(`DELETE FROM outlet_stocks WHERE product_id=?`, [id]);
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
