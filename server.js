const { Client } = require('pg');
const express = require('express');
const port = process.env.PORT || 3001;
const client = new Client(
  process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory'
);

const app = express();
app.use(express.json());

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');
  } catch (err) {
    console.error('Database connection error', err);
  }
}

// GET /api/employees
app.get('/api/employees', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/departments
app.get('/api/department', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM department');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//POST /api/employees
app.post('/api/employees', async (req, res) => {
  const { name, department_id } = req.body;

  console.log('Request body:', req.body);

  if (!name || !department_id) {
    return res
      .status(400)
      .json({ error: 'Name and department_id are required' });
  }

  try {
    const result = await client.query(
      'INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *',
      [name, department_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/employees/:id
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM employees WHERE id = $1', [
      id,
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Employee not found' });
    } else {
      res.status(204).send();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, department_id } = req.body;
  try {
    const result = await client.query(
      'UPDATE employees SET name = $1, department_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, department_id, id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Employee not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

connectToDatabase();
