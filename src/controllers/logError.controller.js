
const LogError = require("../models/logError.model");

// Obtenir tous les logs d'erreurs
exports.getAllErrors = async (req, res) => {
    try {
        const errors = await LogError.find().populate("userId", "firstName lastName email");
        res.json(errors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un log d'erreur par ID
exports.getErrorById = async (req, res) => {
    try {
        const errorLog = await LogError.findById(req.params.id).populate("userId", "firstName lastName email");
        if (!errorLog) return res.status(404).json({ message: "Log d'erreur non trouvé" });
        res.json(errorLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouveau log d'erreur
exports.createErrorLog = async (req, res) => {
    try {
        const newError = new LogError(req.body);
        await newError.save();
        res.status(201).json(newError);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un log d'erreur
exports.deleteErrorLog = async (req, res) => {
    try {
        const deletedError = await LogError.findByIdAndDelete(req.params.id);
        if (!deletedError) return res.status(404).json({ message: "Log d'erreur non trouvé" });
        res.json({ message: "Log d'erreur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
