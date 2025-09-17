const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only apply proxy in development environment
  if (process.env.NODE_ENV === 'development') {
    app.use(
      '/query',
      createProxyMiddleware({
        target: 'http://localhost:8000',
        changeOrigin: true,
      })
    );
    
    app.use(
      '/health',
      createProxyMiddleware({
        target: 'http://localhost:8000',
        changeOrigin: true,
      })
    );
    
    app.use(
      '/data',
      createProxyMiddleware({
        target: 'http://localhost:8000',
        changeOrigin: true,
      })
    );
  }
};