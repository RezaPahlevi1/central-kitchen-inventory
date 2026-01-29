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
  if (!conn) {
    throw new Error("DB Connection is required");
  }

  if (qty <= 0) {
    throw new Error("Qty harus lebih dari 0");
  }

  // Lock product row
  const [[product]] = await conn.query(
    `SELECT stock FROM products WHERE id = ? FOR UPDATE`,
    [product_id],
  );

  if (!product) {
    throw new Error("Product tidak ditemukan");
  }

  // Validasi stok
  if (direction === "OUT" && product.stock < qty) {
    throw new Error("Stok tidak mencukupi");
  }

  // Update stock
  const operator = direction === "IN" ? "+" : "-";

  await conn.query(
    `UPDATE products 
     SET stock = stock ${operator} ? 
     WHERE id = ?`,
    [qty, product_id],
  );

  // Insert ledger
  await conn.query(
    `INSERT INTO stock_movements
      (product_id, outlet_id, qty, direction, movement_type, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [product_id, outlet_id, qty, direction, movement_type, note, admin_id],
  );
};
