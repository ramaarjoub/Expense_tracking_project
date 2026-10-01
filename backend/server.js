const express = require('express');
const cors = require('cors');
const pool = require('./db');

require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper: validation
function validateExpense(body) {
  const { title, amount, category, date } = body;

  const allowedCategories = ["Food", "Transport", "Bills", "Entertainment", "Other"];

  if (!title || typeof title !== "string") {
    return "Title is required";
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Amount must be a number greater than 0";
  }
  if (!allowedCategories.includes(category)) {
    return "Category must be one of: Food, Transport, Bills, Entertainment, Other";
  }
  if (!date) {
    return "Date is required";
  }

  return null;
}

// GET all
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, amount, category, date
       FROM expenses
       ORDER BY id DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET by id (اختياري حسب الدوك: عندكم GET /:id)
app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, title, amount, category, date
       FROM expenses
       WHERE id = $1;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create
app.post('/api/expenses', async (req, res) => {
  try {
    const validationError = validateExpense(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, amount, category, date } = req.body;

    const numericAmount = Number(amount);

    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, amount, category, date;`,
      [title, numericAmount, category, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
  
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const validationError = validateExpense(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { id } = req.params;
    const { title, amount, category, date } = req.body;
    const numericAmount = Number(amount);

    const result = await pool.query(
      `UPDATE expenses
       SET title = $1,
           amount = $2,
           category = $3,
           date = $4
       WHERE id = $5
       RETURNING id, title, amount, category, date;`,
      [title, numericAmount, category, date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM expenses
       WHERE id = $1
       RETURNING id;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
