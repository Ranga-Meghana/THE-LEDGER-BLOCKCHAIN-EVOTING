// Minimal dependency-free request validation. For a larger project, swap this
// for a schema library (zod/joi) — kept intentionally small here.
function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === "");
    if (missing.length) {
      return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
    }
    next();
  };
}

module.exports = { requireFields };
