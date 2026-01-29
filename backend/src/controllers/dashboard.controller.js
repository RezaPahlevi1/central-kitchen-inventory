import pool from "../config/db.js";

export const getDashboard = async (req, res) => {
  try {
    // LOW STOCK
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

    // TODAY MOVEMENT
    const [[todayMovement]] = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN direction='IN' THEN qty END),0) AS todayIn,
        COALESCE(SUM(CASE WHEN direction='OUT' THEN qty END),0) AS todayOut
      FROM stock_movements
      WHERE DATE(created_at) = CURDATE()
    `);

    res.json({
      lowStockProducts,
      todayMovement: {
        todayIn: todayMovement.todayIn,
        todayOut: todayMovement.todayOut,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
