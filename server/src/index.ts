import app from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down server...");
  process.exit(0);
});

// Start server
app.listen(config.server.port, () => {
  logger.info(`🚀 Server running on port ${config.server.port}`);
  logger.info(`📊 Environment: ${config.server.nodeEnv}`);
  logger.info(
    `🔗 Health check: http://localhost:${config.server.port}/api/health`
  );
  logger.info(`🔗 API v1: http://localhost:${config.server.port}/api/v1`);
});
