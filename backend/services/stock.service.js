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
  if (!conn) throw new Error("DB Connection is required");
  if (qty <= 0) throw new Error("Qty harus lebih dari 0");

  // LOCK PRODUCT (CENTRAL)
  const [[product]] = await conn.query(
    `SELECT stock FROM products WHERE id=? FOR UPDATE`,
    [product_id],
  );

  if (!product) throw new Error("Product tidak ditemukan");

  if (direction === "OUT" && product.stock < qty) {
    throw new Error("Stok Central Kitchen tidak mencukupi");
  }

  // UPDATE CENTRAL
  const operator = direction === "IN" ? "+" : "-";
  await conn.query(
    `UPDATE products SET stock = stock ${operator} ? WHERE id=?`,
    [qty, product_id],
  );

  // LOG CENTRAL
  await conn.query(
    `INSERT INTO stock_movements
     (product_id,outlet_id,qty,direction,movement_type,note,created_by)
     VALUES (?,?,?,?,?,?,?)`,
    [product_id, outlet_id, qty, direction, movement_type, note, admin_id],
  );

  // JIKA TRANSFER → HANDLE OUTLET
  if (movement_type === "TRANSFER" && outlet_id) {
    // UPDATE STOK OUTLET
    await conn.query(
      `
      INSERT INTO outlet_stocks (outlet_id, product_id, stock)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE stock = stock + VALUES(stock)
      `,
      [outlet_id, product_id, qty],
    );

    // LOG IN DI OUTLET
    await conn.query(
      `INSERT INTO stock_movements
       (product_id,outlet_id,qty,direction,movement_type,note,created_by)
       VALUES (?, ?, ?, 'IN', 'TRANSFER', ?, ?)`,
      [product_id, outlet_id, qty, note, admin_id],
    );
  }
};
