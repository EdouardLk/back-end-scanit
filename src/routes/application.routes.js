const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/application.controller");
const authenticateToken = require("../middlewares/auth.middleware");

// Définition des routes
router.get("/stats", authenticateToken, applicationController.getApplicationStats);
router.get("/user", authenticateToken, applicationController.getUserApplications);
router.get("/:id", authenticateToken, applicationController.getApplicationById);

router.post("/create", authenticateToken, applicationController.createApplication);

router.put("/update/:id", authenticateToken, applicationController.updateApplication);

router.delete("/:id", authenticateToken, applicationController.deleteApplication);

module.exports = router; 