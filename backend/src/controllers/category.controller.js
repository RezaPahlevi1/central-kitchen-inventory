import pool from "../config/db.js";

/**
 * POST /api/categories
 */
export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );

    res.status(201).json({
      message: "Category created",
      category_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create category",
    });
  }
};

/**
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

/**
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  try {
    // cek category exist
    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // cek duplicate name (kecuali dirinya sendiri)
    const [duplicate] = await pool.query(
      "SELECT id FROM categories WHERE name = ? AND id != ?",
      [name, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        message: "Category name already exists",
      });
    }

    await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);

    res.json({
      message: "Category updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update category",
    });
  }
};

/**
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // cek category exist
    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // optional tapi SANGAT disarankan:
    // cek apakah masih dipakai product
    const [used] = await pool.query(
      "SELECT id FROM products WHERE category_id = ? LIMIT 1",
      [id]
    );

    if (used.length > 0) {
      return res.status(400).json({
        message: "Category is still used by products",
      });
    }

    await pool.query("DELETE FROM categories WHERE id = ?", [id]);

    res.json({
      message: "Category deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete category",
    });
  }
};

/**
 * GET /api/categories/:id/products
 */
export const getCategoryProducts = async (req, res) => {
  const { id } = req.params;

  try {
    // cek category exist
    const [category] = await pool.query(
      "SELECT id, name FROM categories WHERE id = ?",
      [id]
    );

    if (category.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // ambil products
    const [products] = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.price,
        p.stock,
        p.created_at,
        a.name AS created_by
      FROM products p
      JOIN admins a ON p.created_by = a.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `,
      [id]
    );

    res.json({
      category: category[0],
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch category products",
    });
  }
};
