const express = require("express");
const router = express.Router();
const templateUserController = require("../controllers/templateUser.controller");
//const authMiddleware = require("../middlewares/auth.middleware");
const authenticateToken = require("../middlewares/auth.middleware");

// Définition des routes
router.get("/:userId", authenticateToken, templateUserController.getTemplatesByUser);

router.post("/buy/:userId", authenticateToken, templateUserController.linkTemplateToUser); // en gros achat de template

// router.delete("/:id", authenticateToken, templateUserController.deleteTemplate); // 

module.exports = router;
