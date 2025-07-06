const CV = require("../models/cv.model");
const User = require("../models/user.model");

// Obtenir tous les CV
exports.getAllCVs = async (req, res) => {
    try {
        
        let isAdminOrModerator = true; // on part du postulat que l'utilisateur est un admin

        const cvs = await CV.find();
        const user = await User.findById(req.user.id);
        // console.log(req.params.userId);
        console.log(user);
        
        isAdminOrModerator = (user.role == "admin" || user.role == "moderator" ); 

        if(!isAdminOrModerator){ // si il n'est pas admin alors on peut envoyer uniqument les données qui lui appartiennent à l'utilisateur 

            if(cvs[0].userId !== req.params.userId){
                return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autrorisé à accéder à cette donnée" });            
            }
        }

        return res.status(200).json(cvs);

    } catch (error) {
        console.log('erreur wsh')
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un CV par ID
exports.getCVById = async (req, res) => {
    try {

        let isAdminOrModerator = true;

        const cv = await CV.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!cv) return res.status(404).json({ message: "CV non trouvé" });        

        isAdminOrModerator = (user.role == "admin" || user.role == "moderator" ); 

        if(!isAdminOrModerator){ // si il n'est pas admin alors on peut envoyer uniqument les données qui lui appartiennent à l'utilisateur 

            if(cv.userId !== user._id){
                return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autrorisé à accéder à cette donnée" });            
            }
        }

        res.status(200).json(cv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les CVs d'un utilisateur 
exports.getCVsByUserId = async (req, res) => {
    try {
        console.log(req.user);
        let isAdminOrModerator = true;

        const userId  = req.user.id; // depuis le token
        //console.log(userId);
        const cvs = await CV.find({ userId });
        const user = await User.findById(userId);

        if (cvs.length === 0) {
            return res.status(404).json({ message: "Aucun CV trouvé pour cet utilisateur" });
        }

        isAdminOrModerator = (user.role == "admin" || user.role == "moderator" ); 

        if(!isAdminOrModerator){ // si il n'est pas admin alors on peut envoyer uniqument les données qui lui appartiennent à l'utilisateur 

            if(cvs[0].userId !== user._id){
                return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autrorisé à accéder à cette donnée" });            
            }
        }

        res.status(200).json(cvs);
    } catch (error) {
        
        res.status(500).json({ message: error.message });
    }
}; 

// Créer un nouveau CV
exports.createCV = async (req, res) => {
    try {
        //console.log("in")
        const newCV = new CV({
            name: req.body.name,
            content: req.body.content,
            AIGenerated: req.body.AIGenerated || false,
            userId: req.body.userId // transmis directement
        });

        await newCV.save();
        res.status(201).json(newCV);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un CV
exports.updateCV = async (req, res) => {
    try {

        const cv = await CV.findById(req.params.id);
        const user = await User.findById(req.user.id);

        let isAdminOrModerator = true;

        isAdminOrModerator = (user.role == "admin" || user.role == "moderator" ); 

        if(!isAdminOrModerator){ // si il n'est pas admin alors il l'utilisateur ne peut modifier QUE les cv qui lui appartiennt 

            if(cv.userId !== user._id){
                return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autrorisé à modifier à cette donnée" });            
            }
        }

        console.log(cv);
        const updatedCV = await CV.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCV) return res.status(404).json({ message: "CV modification échouée" });
        res.json(updatedCV);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un CV
exports.deleteCV = async (req, res) => {
    try {
                
        const deletedCV = await CV.findByIdAndDelete(req.params.id);
        if (!deletedCV) return res.status(404).json({ message: "CV non trouvé" });
        res.json({ message: "CV supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les statistiques des CV d'un utilisateur
exports.getUserCVStats = async (req, res) => {
    try {
        const userId = req.user.id; // depuis le token
        
        // Récupérer tous les CV complétés de l'utilisateur
        const cvs = await CV.find({ 
            userId,
            status: 'completed'
        });
        
        // Calculer le nombre total d'analyses
        const totalAnalyses = cvs.length;
        
        // Calculer le nombre d'analyses des 30 derniers jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentCVs = cvs.filter(cv => 
            new Date(cv.createdAt) >= thirtyDaysAgo
        );
        const recentAnalyses = recentCVs.length;
        
        // Calculer le score moyen
        const averageScore = cvs.length > 0
            ? Math.round(
                cvs.reduce((sum, cv) => sum + (cv.score.overall || 0), 0) / cvs.length
              )
            : 0;

        // Obtenir les dernières analyses
        const recentAnalysesList = await CV.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name score status createdAt');
        
        res.status(200).json({
            totalAnalyses,
            recentAnalyses,
            averageScore,
            recentAnalysesList
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: error.message });
    }
};
