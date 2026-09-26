function errorHandler(err, req, res, next) {
  console.error('[LegalLens Error]', err.code ? `[${err.code}]` : '', err.message || err);

  const statusCode = err.statusCode || (typeof err.status === 'number' ? err.status : 500);
  const errorCode = err.code || (statusCode === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred while processing your legal request.';

  res.status(statusCode).json({
    error: message,
    code: errorCode,
    disclaimer: 'LegalLens provides general legal information and document analysis, not legal advice.'
  });
}

module.exports = errorHandler;
