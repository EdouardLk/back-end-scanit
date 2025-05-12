const express = require("express");
const router = express.Router();
const logErrorController = require("../controllers/logError.controller");

// Définition des routes
router.get("/", logErrorController.getAllErrors);
router.get("/:id", logErrorController.getErrorById);
router.post("/", logErrorController.createErrorLog);
router.delete("/:id", logErrorController.deleteErrorLog);

module.exports = router;
