import { Pool } from 'pg';

// Database pool configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

// Function to check database connection
const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
  } catch (error) {
    console.error('Database connection error:', error.stack);
    process.exit(1); // Exit the process with an error code
  }
};

// Call the function to check database connection
checkDatabaseConnection();
