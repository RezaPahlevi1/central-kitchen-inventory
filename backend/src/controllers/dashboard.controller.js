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

    const [recentMovements] = await pool.query(`
       SELECT 
        p.name,
        sm.qty,
        sm.direction,
        sm.created_at,
        o.name AS outlet_name
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      LEFT JOIN outlets o ON o.id = sm.outlet_id
      ORDER BY sm.created_at DESC
      LIMIT 5;
      `);

    res.json({
      lowStockProducts,
      todayMovement: {
        todayIn: todayMovement.todayIn,
        todayOut: todayMovement.todayOut,
      },
      movementChart,
      recentMovements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
