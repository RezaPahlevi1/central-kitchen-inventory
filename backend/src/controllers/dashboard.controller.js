import pool from "../config/db.js";

export const getLowStock = async (req, res) => {
  try {
    const [lowStockProducts] = await pool.query(`
      SELECT
        id,
        name,
        stock,
        min_stock
      FROM products
      WHERE stock <= min_stock
      ORDER BY stock ASC
    `);

    res.json({
      lowStockProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
