import pool from "../config/db.js";

/**
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  const { name, price, stock, category_id, company_ids } = req.body;

  // basic validation
  if (
    !name ||
    price === undefined ||
    stock === undefined ||
    category_id === undefined
  ) {
    return res.status(400).json({
      message: "Required fields are missing",
    });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[admin]] = await conn.query(
      `SELECT id FROM admins WHERE role = 'superadmin' AND is_active = 1 LIMIT 1`
    );

    if (!admin) {
      throw new Error("Superadmin not found");
    }

    // 2️⃣ insert product
    const [result] = await conn.query(
      `INSERT INTO products 
        (name, price, stock, category_id, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name, price, stock, category_id, admin.id]
    );

    const productId = result.insertId;

    // 3️⃣ insert relasi product ↔ companies
    if (Array.isArray(company_ids) && company_ids.length > 0) {
      const values = company_ids.map((companyId) => [productId, companyId]);

      await conn.query(
        `INSERT INTO product_companies (product_id, company_id)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: "Product created successfully",
      product_id: productId,
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);

    res.status(500).json({
      message: "Failed to create product",
    });
  } finally {
    conn.release();
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
        p.price,
        p.stock,
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
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

/**
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category_id, company_ids } = req.body;

  if (
    !name ||
    price === undefined ||
    stock === undefined ||
    category_id === undefined
  ) {
    return res.status(400).json({
      message: "Required fields are missing",
    });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ cek product exist
    const [[product]] = await conn.query(
      `SELECT id FROM products WHERE id = ?`,
      [id]
    );

    if (!product) {
      await conn.rollback();
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 2️⃣ update product
    await conn.query(
      `UPDATE products 
       SET name = ?, price = ?, stock = ?, category_id = ?
       WHERE id = ?`,
      [name, price, stock, category_id, id]
    );

    // 3️⃣ update relasi companies (reset & insert ulang)
    if (Array.isArray(company_ids)) {
      await conn.query(`DELETE FROM product_companies WHERE product_id = ?`, [
        id,
      ]);

      if (company_ids.length > 0) {
        const values = company_ids.map((cid) => [id, cid]);
        await conn.query(
          `INSERT INTO product_companies (product_id, company_id)
           VALUES ?`,
          [values]
        );
      }
    }

    await conn.commit();

    res.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({
      message: "Failed to update product",
    });
  } finally {
    conn.release();
  }
};

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ cek product
    const [[product]] = await conn.query(
      `SELECT id FROM products WHERE id = ?`,
      [id]
    );

    if (!product) {
      await conn.rollback();
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 2️⃣ hapus relasi
    await conn.query(`DELETE FROM product_companies WHERE product_id = ?`, [
      id,
    ]);

    // 3️⃣ hapus product
    await conn.query(`DELETE FROM products WHERE id = ?`, [id]);

    await conn.commit();

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({
      message: "Failed to delete product",
    });
  } finally {
    conn.release();
  }
};
