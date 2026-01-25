import pool from "../config/db.js";

/**
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  const { name, unit, min_stock, stock, category_id } = req.body;

  if (!name || !unit || stock === undefined || !category_id) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const [[admin]] = await pool.query(
      `SELECT id FROM admins WHERE role = 'superadmin' AND is_active = 1 LIMIT 1`,
    );

    if (!admin) {
      return res.status(404).json({ message: "Superadmin not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO products 
        (name, unit, min_stock, stock, category_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, unit, min_stock || 0, stock, category_id, admin.id],
    );

    res.status(201).json({
      message: "Product created successfully",
      product_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create product" });
  }
};

/**
 * GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
      ORDER BY p.created_at DESC
    `);

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

  if (!name || !unit || stock === undefined || !category_id) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, unit = ?, min_stock = ?, stock = ?, category_id = ?
       WHERE id = ?`,
      [name, unit, min_stock || 0, stock, category_id, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
