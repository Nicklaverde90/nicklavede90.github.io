require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    min: Number(process.env.DB_POOL_MIN ?? 0),
    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE ?? 30000),
  },
};

let connectionPool;

async function getPool() {
  if (connectionPool) {
    return connectionPool;
  }

  try {
    connectionPool = await sql.connect(config);
    return connectionPool;
  } catch (error) {
    connectionPool = undefined;
    throw error;
  }
}

module.exports = {
  sql,
  getPool,
};
