const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS fix
app.use(cors({
  origin: '*'
}));

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table on startup
pool.query(`CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false
)`);

app.get('/todos', async (req, res) => {
  const result = await pool.query('SELECT * FROM todos ORDER BY id');
  res.json(result.rows);
});

app.post('/todos', async (req, res) => {
  const { title } = req.body;
  const result = await pool.query(
    'INSERT INTO todos (title) VALUES ($1) RETURNING *',
    [title]
  );
  res.json(result.rows[0]);
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const result = await pool.query(
    'UPDATE todos SET title=$1, completed=$2 WHERE id=$3 RETURNING *',
    [title, completed, id]
  );
  res.json(result.rows[0]);
});

app.delete('/todos/:id', async (req, res) => {
  await pool.query('DELETE FROM todos WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

app.listen(process.env.PORT || 5000, () => console.log('Backend running'));