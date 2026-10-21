import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  connectionTimeoutMillis: 5000,
});

try {
  const result = await pool.query(`
    SELECT current_database() AS database,
           current_user AS username
  `);

  console.log("PostgreSQL connection successful.");
  console.log(result.rows[0]);
} catch (error) {
  console.error("PostgreSQL connection failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
