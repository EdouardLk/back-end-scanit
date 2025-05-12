const express = require("express");
const router = express.Router();
const templateController = require("../controllers/template.controller");
//const authMiddleware = require("../middlewares/auth.middleware");
const authenticateToken = require("../middlewares/auth.middleware");

// Définition des routes
router.get("/" ,templateController.getAllTemplates);
router.get("/:id", templateController.getTemplateById);

router.post("/create", authenticateToken, templateController.createTemplate);  // surement depuis un back office également

router.put("/:id", authenticateToken, templateController.updateTemplate); //probalement à changer

router.delete("/:id", authenticateToken, templateController.deleteTemplate); // surement depuis un back office

module.exports = router;
