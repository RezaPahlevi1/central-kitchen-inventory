import pool from "../config/db.js";

export const getDashboard = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;

    const [movementChart] = await pool.query(
      `
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN direction='IN' THEN qty ELSE 0 END) as totalIn,
        SUM(CASE WHEN direction='OUT' THEN qty ELSE 0 END) as totalOut
      FROM stock_movements
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      `,
      [days],
    );

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
      movementChart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
