
const TemplatesUsers = require('../models/templateUser.model'); // ajuste le chemin si nécessaire

// GET /api/templates-users/:userId
exports.getTemplatesByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const templates = await TemplatesUsers.find({ userId })
      .populate('templateId') // Récupère les infos du template
      .exec();

    const extractedTemplates = templates.map(entry => entry.templateId); // optionnel : ne renvoyer que les templates

    return res.status(200).json(extractedTemplates);
  } catch (error) {
    console.error('Erreur lors de la récupération des templates utilisateur :', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/templates-users/
exports.linkTemplateToUser = async (req, res) => {
  try {

    let userId = req.user.id; //depuis le token
    const { templateId } = req.body;

    if (!userId || !templateId) {
      return res.status(400).json({ message: "userId et templateId sont requis. Rappel :  Le userId est manquant dans le header Authorization OU templateId ne figure pas dans le body de la requête" });
    }

    // Vérifie si l'association existe déjà
    const exists = await TemplatesUsers.findOne({ userId, templateId });
    if (exists) {
      return res.status(409).json({ message: "L'utilisateur possède déjà ce template." });
    }

    const newLink = new TemplatesUsers({ userId, templateId });
    const saved = await newLink.save();

    return res.status(201).json(saved);
  } catch (error) {
    console.error("Erreur lors de la création de l'association template-utilisateur :", error.message);
    return res.status(500).json({ message: error.message });
  }
};

