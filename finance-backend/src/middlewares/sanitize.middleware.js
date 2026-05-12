/**
 * NoSQL injection sanitizer — Express 5 compatible.
 *
 * express-mongo-sanitize@2.2.0 does `req[key] = target` for
 * ['body', 'params', 'headers', 'query'].  In Express 5, req.query
 * and req.headers are read-only getters on IncomingMessage.prototype,
 * so that assignment throws:
 *   "Cannot set property query of #<IncomingMessage> which has only a getter"
 *
 * This replacement sanitizes in-place: it walks each object's own keys
 * and deletes any that start with "$" or contain ".", then recurses into
 * nested objects/arrays.  Mutating existing properties is always safe;
 * replacing the reference is what breaks Express 5.
 */

function stripBadKeys(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(stripBadKeys);
    return;
  }
  if (obj !== null && typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        stripBadKeys(obj[key]);
      }
    });
  }
}

module.exports = function mongoSanitize() {
  return function sanitizeRequest(req, _res, next) {
    // Mutate in-place — never reassign req.query / req.params / req.headers
    if (req.body && typeof req.body === "object") {
      stripBadKeys(req.body);
    }
    if (req.params && typeof req.params === "object") {
      stripBadKeys(req.params);
    }
    // req.query is a read-only getter in Express 5 — only mutate its contents
    if (req.query && typeof req.query === "object") {
      stripBadKeys(req.query);
    }
    next();
  };
};
