import { Pool } from "pg";
import { config } from "../config";

// Test database configuration
const testConfig = {
  ...config.database,
  database: config.database.name + "_test",
};

// Create test database pool
export const testPool = new Pool(testConfig);

// Setup test database
export const setupTestDatabase = async () => {
  try {
    // Connect to test database
    await testPool.connect();
    console.log("Connected to test database");

    // Run migrations for test database
    // This would typically run the same migrations as production
    // but on the test database

    return testPool;
  } catch (error) {
    console.error("Failed to setup test database:", error);
    throw error;
  }
};

// Cleanup test database
export const cleanupTestDatabase = async () => {
  try {
    // Drop all tables in test database
    await testPool.query("DROP SCHEMA public CASCADE");
    await testPool.query("CREATE SCHEMA public");
    await testPool.query("GRANT ALL ON SCHEMA public TO postgres");
    await testPool.query("GRANT ALL ON SCHEMA public TO public");

    console.log("Test database cleaned up");
  } catch (error) {
    console.error("Failed to cleanup test database:", error);
    throw error;
  }
};

// Global test setup
beforeAll(async () => {
  await setupTestDatabase();
});

// Global test cleanup
afterAll(async () => {
  await cleanupTestDatabase();
  await testPool.end();
});



