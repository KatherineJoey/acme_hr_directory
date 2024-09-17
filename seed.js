const { Client } = require('pg');

const client = new Client(
  process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory'
);

async function init() {
  try {
    await client.connect();
    console.log('Connected to the database');

    const sql = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS department;

        CREATE TABLE IF NOT EXISTS department(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS employees(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        department_id INTEGER REFERENCES department(id) NOT NULL
        );
    `;

    await client.query(sql);
    console.log('Database tables have been set up');

    //initial data
    await client.query(`
        INSERT INTO department (name) VALUES ('HR'), ('Engineering'), ('Payroll');
        `);

    await client.query(`
        INSERT INTO employees (name, department_id) VALUES 
        ('Alicia', 1), ('Bob', 2), ('Mark', 3), ('Susan', 2), ('John', 3), ('Kyle', 1), ('Eliza', 2);
        `);

    console.log('Database seeded with initial data');
  } catch (err) {
    console.error('Database initialization error', err);
  } finally {
    await client.end();
    console.log('Database client disconnected');
  }
}

init();
