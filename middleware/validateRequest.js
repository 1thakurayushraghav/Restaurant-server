const { sendError } = require("../utils/apiResponse");

// Usage: validate(schema, 'body' | 'query' | 'params')
const validateRequest = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid request data";
    return sendError(res, 400, message, "VALIDATION_ERROR");
  }
  req[source] = result.data;
  next();
};

module.exports = validateRequest;
