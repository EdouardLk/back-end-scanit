const express = require("express");
const router = express.Router();
const cvController = require("../controllers/cv.controller");
//const authMiddleware = require("../middlewares/auth.middleware");
const authenticateToken = require("../middlewares/auth.middleware");

// Définition des routes [Ne pas modifier l'ordre]
router.get("/all", authenticateToken, cvController.getAllCVs);
router.get("/stats", authenticateToken, cvController.getUserCVStats);
router.get("/user", authenticateToken, cvController.getCVsByUserId);
router.get("/:id", authenticateToken, cvController.getCVById);

router.post("/create", authenticateToken, cvController.createCV);

router.put("/update/:id", authenticateToken, cvController.updateCV);

router.delete("/:id", authenticateToken, cvController.deleteCV);

module.exports = router;
