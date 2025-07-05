
// const logError = require("../utils/error");
const Template = require("../models/template.model");
const User =  require("../models/user.model");

// Obtenir tous les templates
exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.find();
        res.json(templates);
    } catch (error) {
        //await logError("Échec de la récupération des templates", req.user?.id);
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un template par ID
exports.getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) {
            //await logError(`Template non trouvé : ${req.params.id}`, req.user?.id);
            return res.status(404).json({ message: "Template non trouvé" });
        }
        res.json(template);
    } catch (error) {
        //await logError(`Erreur lors de la récupération du template : ${req.params.id}`, req.user?.id);
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouveau template
exports.createTemplate = async (req, res) => {
    try {

        let isAdminOrModerator = (req.user.role == "admin" || req.user.role == "moderator"); // depuis le token

        if (!isAdminOrModerator) {             
            return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autoriser à créer de nouveaux templates" });            
        }

        const newTemplate = new Template(req.body);
        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        //await logError("Échec de la création d'un template", req.user?.id);
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un template
exports.updateTemplate = async (req, res) => {
    try {

        let isAdminOrModerator = (req.user.role == "admin" || req.user.role == "moderator"); // depuis le token

        if (!isAdminOrModerator) {             
            return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autoriser à créer de nouveaux templates" });            
        }

        const updatedTemplate = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTemplate) {
            //await logError(`Échec de la mise à jour : Template introuvable (${req.params.id})`, req.user?.id);
            return res.status(404).json({ message: "Template non trouvé" });
        }
        res.json(updatedTemplate);
    } catch (error) {
        //await logError(`Erreur lors de la mise à jour du template : ${req.params.id}`, req.user?.id);
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un template
exports.deleteTemplate = async (req, res) => {
    try {

        let isAdminOrModerator = (req.user.role == "admin" || req.user.role == "moderator"); // depuis le token

        if (!isAdminOrModerator) {             
            return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autoriser à créer de nouveaux templates" });            
        }
        
        const deletedTemplate = await Template.findByIdAndDelete(req.params.id);
        if (!deletedTemplate) {
            //await logError(`Échec de la suppression : Template introuvable (${req.params.id})`, req.user?.id);
            return res.status(404).json({ message: "Template non trouvé" });
        }
        res.json({ message: "Template supprimé avec succès" });
    } catch (error) {
        //await logError(`Erreur lors de la suppression du template : ${req.params.id}`, req.user?.id);
        res.status(500).json({ message: error.message });
    }
};
