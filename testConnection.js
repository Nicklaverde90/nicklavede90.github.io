const { getPool } = require('./db');

async function run() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 AS ok');
    console.log('Database connection successful:', result.recordset[0].ok === 1);
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

run();
