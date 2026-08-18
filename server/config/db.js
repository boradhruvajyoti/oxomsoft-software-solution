const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'oxomsoft_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

let isDbConnected = false;

/**
 * Initialize database and create tables if they do not exist
 */
async function initDB() {
  try {
    const connection = await pool.getConnection();
    isDbConnected = true;
    console.log(`[DB] Connected to MySQL database "${process.env.DB_NAME || 'oxomsoft_db'}" successfully.`);

    // Create contact_messages table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent VARCHAR(255) DEFAULT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableQuery);
    console.log('[DB] Table "contact_messages" verified/created.');
    connection.release();
    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn(`[DB WARNING] Could not connect to MySQL (${error.code || error.message}).`);
    console.warn('[DB WARNING] App will continue in fallback mode. Ensure MySQL is running with the proper credentials.');
    return false;
  }
}

module.exports = {
  pool,
  initDB,
  isDbConnected: () => isDbConnected,
};
