import "dotenv/config";
import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 1,
  connectTimeout: 10000,
});
try {
  const rows = await pool.query("SELECT DATABASE() AS database_name, CURRENT_USER() AS database_user");
  console.log("MariaDB connection successful.");
  console.log(rows[0]);
} catch (error) {
  console.error("MariaDB connection failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
