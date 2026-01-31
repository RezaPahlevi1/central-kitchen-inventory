import pool from "../config/db.js";

export const getOutlets = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM outlets ORDER BY name ASC",
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch outlets",
    });
  }
};

// controllers/outlet.controller.js

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
