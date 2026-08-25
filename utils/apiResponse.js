class ApiError extends Error {
  constructor(statusCode, message, code = "ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function sendSuccess(res, data = {}, statusCode = 200, meta = undefined) {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function sendError(res, statusCode = 500, message = "Something went wrong", code = "ERROR") {
  return res.status(statusCode).json({ success: false, message, code });
}

module.exports = { ApiError, sendSuccess, sendError };
