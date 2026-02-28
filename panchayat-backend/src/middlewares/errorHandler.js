export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({ detail: err.message || 'Internal server error' });
};
