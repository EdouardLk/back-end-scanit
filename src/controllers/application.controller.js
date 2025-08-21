const Application = require("../models/application.model");
const CV = require("../models/cv.model");
const User = require("../models/user.model");
const mongoose = require('mongoose');

// Obtenir toutes les candidatures d'un utilisateur
exports.getUserApplications = async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user.id })
            .populate('cvId', 'name score createdAt')
            .sort({ createdAt: -1 });
        
        return res.status(200).json(applications);
    } catch (error) {
        console.error('Erreur lors de la récupération des candidatures:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtenir une candidature par ID
exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('cvId', 'name score createdAt')
            .populate('userId', 'firstName lastName email');

        if (!application) {
            return res.status(404).json({ message: "Candidature non trouvée" });
        }

        // Vérifier que l'utilisateur est propriétaire de la candidature
        if (application.userId._id.toString() !== req.user.id) {
            return res.status(401).json({ message: "Unauthorized : Accès non autorisé à cette candidature" });
        }

        return res.status(200).json(application);
    } catch (error) {
        console.error('Erreur lors de la récupération de la candidature:', error);
        res.status(500).json({ message: error.message });
    }
};

// Créer une nouvelle candidature
exports.createApplication = async (req, res) => {
    try {
        const { cvId, companyName, jobTitle, status, comments, applicationDate } = req.body;

        // Vérifier que le CV existe et appartient à l'utilisateur
        const cv = await CV.findById(cvId);
        if (!cv) {
            return res.status(404).json({ message: "CV non trouvé" });
        }
        
        if (cv.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: "Unauthorized : Ce CV ne vous appartient pas" });
        }

        const newApplication = new Application({
            userId: req.user.id,
            cvId,
            companyName,
            jobTitle,
            status: status || 'pending',
            comments,
            applicationDate: applicationDate || new Date()
        });

        const savedApplication = await newApplication.save();
        
        // Populate les données pour la réponse
        const populatedApplication = await Application.findById(savedApplication._id)
            .populate('cvId', 'name score createdAt');

        return res.status(201).json(populatedApplication);
    } catch (error) {
        console.error('Erreur lors de la création de la candidature:', error);
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une candidature
exports.updateApplication = async (req, res) => {
    try {
        const { companyName, jobTitle, status, comments, applicationDate } = req.body;

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Candidature non trouvée" });
        }

        // Vérifier que l'utilisateur est propriétaire de la candidature
        if (application.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: "Unauthorized : Accès non autorisé à cette candidature" });
        }

        // Mettre à jour les champs
        if (companyName !== undefined) application.companyName = companyName;
        if (jobTitle !== undefined) application.jobTitle = jobTitle;
        if (status !== undefined) application.status = status;
        if (comments !== undefined) application.comments = comments;
        if (applicationDate !== undefined) application.applicationDate = applicationDate;

        const updatedApplication = await application.save();
        
        // Populate les données pour la réponse
        const populatedApplication = await Application.findById(updatedApplication._id)
            .populate('cvId', 'name score createdAt');

        return res.status(200).json(populatedApplication);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la candidature:', error);
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une candidature
exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Candidature non trouvée" });
        }

        // Vérifier que l'utilisateur est propriétaire de la candidature
        if (application.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: "Unauthorized : Accès non autorisé à cette candidature" });
        }

        await Application.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Candidature supprimée avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression de la candidature:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les statistiques des candidatures d'un utilisateur
exports.getApplicationStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Statistiques générales
        const totalApplications = await Application.countDocuments({ userId });
        
        // Candidatures par statut
        const statusStats = await Application.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Candidatures récentes (30 derniers jours)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentApplications = await Application.countDocuments({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Transformer les stats par statut en objet
        const statusCounts = {
            pending: 0,
            interview: 0,
            rejected: 0,
            accepted: 0
        };
        
        statusStats.forEach(stat => {
            statusCounts[stat._id] = stat.count;
        });

        return res.status(200).json({
            totalApplications,
            recentApplications,
            statusCounts
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: error.message });
    }
}; 