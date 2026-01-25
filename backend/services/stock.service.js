export const recordStockMovement = async ({
  conn,
  product_id,
  outlet_id = null,
  qty,
  direction,
  movement_type,
  note = null,
  admin_id,
}) => {
  // update stock
  if (direction === "OUT") {
    await conn.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [
      qty,
      product_id,
    ]);
  }

  if (direction === "IN") {
    await conn.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [
      qty,
      product_id,
    ]);
  }

  // insert log
  await conn.query(
    `INSERT INTO stock_movements
     (product_id, outlet_id, qty, direction, movement_type, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [product_id, outlet_id, qty, direction, movement_type, note, admin_id],
  );
};
