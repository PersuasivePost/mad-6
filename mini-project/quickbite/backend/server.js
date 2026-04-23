const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  // Don't crash immediately, but endpoints will fail with a clear message.
  console.warn(
    "[WARN] DATABASE_URL is not set. Create backend/.env from .env.example",
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

function httpError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

async function query(text, params) {
  return pool.query(text, params);
}

function generateToken() {
  // 2-digit cafeteria-style token
  return Math.floor(10 + Math.random() * 90);
}

function requireEmployee(req, res, next) {
  // Minimal role check (demo): client sends x-user-role: employee
  const role = String(req.headers["x-user-role"] || "")
    .trim()
    .toLowerCase();
  if (role !== "employee")
    return httpError(res, 403, "Employee access required");
  return next();
}

function requireManager(req, res, next) {
  const role = String(req.headers["x-user-role"] || "")
    .trim()
    .toLowerCase();
  if (role !== "manager") return httpError(res, 403, "Manager access required");
  return next();
}

// Health
app.get("/", (req, res) => {
  res.json({ ok: true, service: "QuickBite API" });
});

// GET /stalls
app.get("/stalls", async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, name, description, image_url, is_open, prep_time FROM stalls ORDER BY id ASC",
    );
    res.json({ ok: true, stalls: rows });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to fetch stalls");
  }
});

// GET /menu/:stallId
app.get("/menu/:stallId", async (req, res) => {
  const stallId = Number(req.params.stallId);
  if (!Number.isFinite(stallId)) return httpError(res, 400, "Invalid stallId");

  try {
    const { rows } = await query(
      `SELECT id, stall_id, name, price, category, is_available, veg_nonveg
       FROM menu_items
       WHERE stall_id = $1
       ORDER BY id ASC`,
      [stallId],
    );
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to fetch menu");
  }
});

// POST /menu (Manager Only)
app.post("/menu", requireManager, async (req, res) => {
  const { stallId, name, price, category, is_available, veg_nonveg } =
    req.body || {};
  if (!name || isNaN(Number(price)) || !stallId) {
    return httpError(res, 400, "Invalid input");
  }

  try {
    const { rows } = await query(
      `INSERT INTO menu_items (stall_id, name, price, category, is_available, veg_nonveg)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [stallId, name, Number(price), category, !!is_available, veg_nonveg],
    );
    res.status(201).json({ ok: true, item: rows[0] });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to create menu item");
  }
});

// PUT /menu/:id (Manager Only - partial updates supported)
app.put("/menu/:id", requireManager, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return httpError(res, 400, "Invalid item id");

  const { name, price, category, is_available, veg_nonveg } = req.body || {};

  try {
    // If a field isn't passed, we can coalesce to existing, but for simplicity here we assume full body replacement.
    // Or we handle partial selectively (useful for toggling availability).
    const updates = [];
    const values = [];
    let queryIdx = 1;

    if (name !== undefined) {
      updates.push(`name = $${queryIdx++}`);
      values.push(name);
    }
    if (price !== undefined) {
      updates.push(`price = $${queryIdx++}`);
      values.push(Number(price));
    }
    if (category !== undefined) {
      updates.push(`category = $${queryIdx++}`);
      values.push(category);
    }
    if (is_available !== undefined) {
      updates.push(`is_available = $${queryIdx++}`);
      values.push(!!is_available);
    }
    if (veg_nonveg !== undefined) {
      updates.push(`veg_nonveg = $${queryIdx++}`);
      values.push(veg_nonveg);
    }

    if (updates.length === 0) return httpError(res, 400, "No fields to update");

    values.push(id);

    const { rows } = await query(
      `UPDATE menu_items SET ${updates.join(", ")} WHERE id = $${queryIdx} RETURNING *`,
      values,
    );

    if (!rows.length) return httpError(res, 404, "Menu item not found");
    res.json({ ok: true, item: rows[0] });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to update menu item");
  }
});

// DELETE /menu/:id (Manager Only)
app.delete("/menu/:id", requireManager, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return httpError(res, 400, "Invalid item id");

  try {
    const { rowCount } = await query("DELETE FROM menu_items WHERE id = $1", [
      id,
    ]);
    if (rowCount === 0) return httpError(res, 404, "Menu item not found");
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to delete menu item");
  }
});

// POST /users/:id/push-token
app.post("/users/:id/push-token", async (req, res) => {
  const id = Number(req.params.id);
  const { token } = req.body || {};

  if (!Number.isFinite(id) || !token) {
    return httpError(res, 400, "Invalid payload");
  }

  try {
    // Add column if it doesn't exist
    await query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token text`,
    );

    const { rows } = await query(
      `UPDATE users
       SET expo_push_token = $2
       WHERE id = $1
       RETURNING id, expo_push_token`,
      [id, token],
    );

    if (!rows.length) return httpError(res, 404, "User not found");
    res.json({ ok: true, detail: "Push token registered successfully" });
  } catch (e) {
    console.error("Error setting push token:", e);
    httpError(res, 500, "Failed to register push token");
  }
});

// PATCH /users/:id
// Body: { name: string }
app.patch("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body?.name || "").trim();

  if (!Number.isFinite(id)) return httpError(res, 400, "Invalid user id");
  if (!name) return httpError(res, 400, "Name is required");

  try {
    const { rows } = await query(
      `UPDATE users
       SET name = $2
       WHERE id = $1
       RETURNING id, name, email, role`,
      [id, name],
    );
    if (!rows.length) return httpError(res, 404, "User not found");
    res.json({ ok: true, user: rows[0] });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to update user");
  }
});

// GET /employee/orders?status=confirmed|preparing|ready
// Returns orders with customer name/email + line-items.
app.get("/employee/orders", requireEmployee, async (req, res) => {
  const status = String(req.query?.status || "")
    .trim()
    .toLowerCase();
  const allowed = new Set(["confirmed", "preparing", "ready"]);
  if (!allowed.has(status)) return httpError(res, 400, "Invalid status");

  try {
    const { rows: orders } = await query(
      `SELECT o.id, o.user_id, o.total, o.token, o.status, o.created_at,
              u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.status = $1
       ORDER BY o.created_at DESC`,
      [status],
    );

    const orderIds = orders.map((o) => o.id);
    let itemsByOrderId = {};
    if (orderIds.length) {
      const { rows: items } = await query(
        `SELECT oi.order_id, oi.menu_item_id, oi.quantity, oi.unit_price, mi.name
         FROM order_items oi
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE oi.order_id = ANY($1::int[])
         ORDER BY oi.id ASC`,
        [orderIds],
      );

      itemsByOrderId = items.reduce((acc, it) => {
        acc[it.order_id] = acc[it.order_id] || [];
        acc[it.order_id].push(it);
        return acc;
      }, {});
    }

    res.json({
      ok: true,
      orders: orders.map((o) => ({ ...o, items: itemsByOrderId[o.id] || [] })),
    });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to fetch employee orders");
  }
});

/**
 * POST /orders
 * Body:
 * {
 *   userId: number,
 *   items: [{ menuItemId: number, quantity: number }]
 * }
 */
app.post("/orders", async (req, res) => {
  const userId = Number(req.body?.userId);
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const clientTotal = req.body?.total;

  if (!Number.isFinite(userId)) return httpError(res, 400, "Invalid userId");
  if (items.length === 0) return httpError(res, 400, "Items required");

  // Validate quantities
  for (const it of items) {
    if (
      !Number.isFinite(Number(it.menuItemId)) ||
      !Number.isFinite(Number(it.quantity))
    ) {
      return httpError(res, 400, "Invalid items");
    }
    if (Number(it.quantity) <= 0)
      return httpError(res, 400, "Quantity must be > 0");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Compute total.
    // If the client sent item prices (e.g. from cart), accept them.
    // Otherwise fall back to DB prices.
    const hasClientPrices = items.every((i) =>
      Number.isFinite(Number(i.price)),
    );
    let priceById = new Map();

    if (!hasClientPrices) {
      const ids = items.map((i) => Number(i.menuItemId));
      const { rows: menuRows } = await client.query(
        `SELECT id, price FROM menu_items WHERE id = ANY($1::int[])`,
        [ids],
      );

      if (menuRows.length !== ids.length) {
        await client.query("ROLLBACK");
        return httpError(res, 400, "One or more menu items not found");
      }
      priceById = new Map(menuRows.map((r) => [r.id, r.price]));
    }

    let total = 0;
    for (const it of items) {
      const qty = Number(it.quantity);
      const unit = hasClientPrices
        ? Number(it.price)
        : priceById.get(Number(it.menuItemId));
      total += unit * qty;
    }

    // If a client provided total, we keep the computed total as source of truth.
    // (We still accept clientTotal in payload for convenience/debugging.)
    void clientTotal;

    const token = generateToken();
    const status = "placed";

    const orderInsert = await client.query(
      `INSERT INTO orders (user_id, total, token, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, total, token, status, created_at`,
      [userId, total, token, status],
    );

    const order = orderInsert.rows[0];

    for (const it of items) {
      const menuItemId = Number(it.menuItemId);
      const quantity = Number(it.quantity);
      const unitPrice = priceById.get(menuItemId);

      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, menuItemId, quantity, unitPrice],
      );
    }

    await client.query("COMMIT");
    res
      .status(201)
      .json({ ok: true, token: order.token, orderId: order.id, order });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    httpError(res, 500, "Failed to create order");
  } finally {
    client.release();
  }
});

// GET /orders/:userId
app.get("/orders/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isFinite(userId)) return httpError(res, 400, "Invalid userId");

  try {
    const { rows: orders } = await query(
      `SELECT id, user_id, total, token, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    // Optional: include items for each order
    const orderIds = orders.map((o) => o.id);
    let itemsByOrderId = {};
    if (orderIds.length) {
      const { rows: items } = await query(
        `SELECT oi.order_id, oi.menu_item_id, oi.quantity, oi.unit_price, mi.name
         FROM order_items oi
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE oi.order_id = ANY($1::int[])`,
        [orderIds],
      );
      itemsByOrderId = items.reduce((acc, item) => {
        acc[item.order_id] = acc[item.order_id] || [];
        acc[item.order_id].push(item);
        return acc;
      }, {});
    }

    res.json({
      ok: true,
      orders: orders.map((o) => ({ ...o, items: itemsByOrderId[o.id] || [] })),
    });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to fetch orders");
  }
});

// GET /orders/:orderId/status
app.get("/orders/:orderId/status", async (req, res) => {
  const orderId = Number(req.params.orderId);
  if (!Number.isFinite(orderId)) return httpError(res, 400, "Invalid orderId");

  try {
    const { rows } = await query(
      `SELECT id, status FROM orders WHERE id = $1`,
      [orderId],
    );
    if (!rows.length) return httpError(res, 404, "Order not found");
    res.json({ ok: true, orderId: rows[0].id, status: rows[0].status });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to fetch order status");
  }
});

// GET /order-items/:orderId
// Returns order items enriched with menu item + stall metadata.
app.get("/order-items/:orderId", async (req, res) => {
  const orderId = Number(req.params.orderId);
  if (!Number.isFinite(orderId)) return httpError(res, 400, "Invalid orderId");

  try {
    const { rows } = await query(
      `SELECT
         oi.order_id,
         oi.menu_item_id,
         oi.quantity,
         oi.unit_price,
         mi.name,
         mi.veg_nonveg,
         mi.stall_id,
         s.name AS stall_name
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       JOIN stalls s ON s.id = mi.stall_id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
      [orderId],
    );

    res.json({ ok: true, orderId, items: rows });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to fetch order items");
  }
});

// PATCH /orders/:id/status
app.patch("/orders/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body?.status || "").trim();

  if (!Number.isFinite(id)) return httpError(res, 400, "Invalid order id");
  if (!status) return httpError(res, 400, "Status is required");

  // For employee flow, restrict some transitions.
  const nextStatus = String(status).toLowerCase();
  const employeeOnlyStatuses = new Set(["preparing", "ready", "rejected"]);
  if (employeeOnlyStatuses.has(nextStatus)) {
    const role = String(req.headers["x-user-role"] || "")
      .trim()
      .toLowerCase();
    if (role !== "employee")
      return httpError(res, 403, "Employee access required");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch existing order to check status before updating
    const { rows: existingRows } = await client.query(
      `SELECT id, user_id, status, total FROM orders WHERE id = $1 FOR UPDATE`,
      [id],
    );

    if (!existingRows.length) {
      await client.query("ROLLBACK");
      return httpError(res, 404, "Order not found");
    }

    const currentOrder = existingRows[0];
    const prevStatus = currentOrder.status.toLowerCase();

    // Prevent cancelling if already past confirmed
    if (
      nextStatus === "cancelled" &&
      !["placed", "confirmed"].includes(prevStatus)
    ) {
      await client.query("ROLLBACK");
      return httpError(res, 400, "Cannot cancel order at this stage");
    }

    const { rows } = await client.query(
      `UPDATE orders
       SET status = $2
       WHERE id = $1
       RETURNING id, user_id, total, token, status, created_at`,
      [id, status],
    );

    const order = rows[0];

    // Handle Refund Logic if cancelled implicitly
    if (
      nextStatus === "cancelled" &&
      ["placed", "confirmed"].includes(prevStatus)
    ) {
      const refundAmount = Number(order.total);

      // Ensure wallet schema exists (add column if missing natively fallback)
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00`,
      );

      // Update wallet
      await client.query(
        `UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + $1 WHERE id = $2`,
        [refundAmount, order.user_id],
      );

      // Attempt to track transaction if transactions table existed (creates it if missing to ensure spec fulfillment)
      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          type VARCHAR(50),
          amount DECIMAL(10,2),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)`,
        [
          order.user_id,
          "refund",
          refundAmount,
          `Refund for cancelled order #${order.token}`,
        ],
      );
    }

    await client.query("COMMIT");

    // Notification Logic! 🚀
    // Fetch the student's expo_push_token safely
    try {
      const { rows: userRows } = await query(
        `SELECT expo_push_token FROM users WHERE id = $1`,
        [order.user_id],
      );
      if (userRows.length && userRows[0].expo_push_token) {
        let tokenStr = userRows[0].expo_push_token;
        if (tokenStr.startsWith("ExponentPushToken")) {
          // Send HTTP request to Expo's Push API
          require("node-fetch")("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Accept-encoding": "gzip, deflate",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: tokenStr,
              sound: "default",
              title: "QuickBite Order Update 🍔",
              body: `Your order #${order.token} is now ${nextStatus}!`,
              data: { orderId: order.id, status: nextStatus },
            }),
          }).catch((err) =>
            console.error("Failed to send push notification HTTP:", err),
          );
        }
      }
    } catch (pushErr) {
      console.error(
        "Push Notification Warning: could not reach token DB or deliver push:",
        pushErr,
      );
    }

    res.json({ ok: true, order });
  } catch (e) {
    console.error(e);
    httpError(res, 500, "Failed to update order status");
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`QuickBite API listening on http://localhost:${PORT}`);
});
