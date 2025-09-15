const sanitizeHtml = require("sanitize-html");

// Middleware générique pour nettoyer toutes les données envoyées dans req.body
function sanitizeMiddleware(req, res, next) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        // Nettoyer chaque champ texte
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [], // aucun tag HTML autorisé
          allowedAttributes: {} // aucun attribut autorisé
        });
      }
    }
  }
  next();
}

module.exports = sanitizeMiddleware;
