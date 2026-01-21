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
