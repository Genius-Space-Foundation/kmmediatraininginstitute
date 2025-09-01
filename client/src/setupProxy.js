const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Proxy all API requests to the backend server
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
      logLevel: "debug",
    })
  );
};
