import { Pool, PoolClient } from "pg";
import { config } from "../config";
import { initializeTables } from "./init";

// Create a connection pool
export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
let isInitialized = false;
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
  // Initialize tables when connection is established (only once)
  if (!isInitialized) {
    isInitialized = true;
    initializeTables().catch(console.error);
  }
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Helper function to get a client from the pool
export const getClient = (): Promise<PoolClient> => {
  return pool.connect();
};

export const closeDatabase = async () => {
  await pool.end();
  console.log("Database connection pool closed");
};
