import app from "./app";
import { config } from "./config";
import { closeDatabase } from "./database/database";
import { logger } from "./utils/logger";

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down server...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down server...");
  await closeDatabase();
  process.exit(0);
});

// Start server
app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Health check: http://localhost:${config.port}/api/health`);
  logger.info(`🔗 API v1: http://localhost:${config.port}/api/v1`);
});
