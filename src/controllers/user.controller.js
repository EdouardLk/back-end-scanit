const User = require("../models/user.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Obtenir tous les utilisateurs // peut être utile si jamais back office
exports.getAllUsers = async (req, res) => {
  try {

    let isAdminOrModerator = (req.user.role == "admin" || req.user.role == "moderator"); // depuis le token

    if (!isAdminOrModerator) {
      return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autoriser à accéder à cette donnée" });
    }
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    //console.log(req.params.id);
    let isAutorized = (req.user.role == "admin" || req.user.role == "moderator" || req.user.id == req.params.id); // depuis le token

    if (!isAutorized) {
      return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autorisé à accéder au information d'un autre utilisateur" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {

    if (req.user !== undefined && req.user !== null) {
      let isAutorized = (req.user.role == "admin" || req.user.role == "moderator" || req.user.id == req.params.id); // depuis le token

      if (!isAutorized) {
        return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autorisé à accéder au information d'un autre utilisateur" });
      }
    }
    //console.log(req.user);

    const user = await User.findOne({ email: decodeURIComponent(req.params.email) });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};


exports.login = async (req, res) => { // cette routes doit être appelée par le auth service. Sinon aucun token ne sera généré
  const { email, password } = req.body;

  try {
    // Recherche l'utilisateur par email
    const user = await User.findOne({ email });
    //console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Compare les mots de passe (plaintext vs hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    return res.status(200).json({ // cette réponse est renvoyé vers le authService
      message: 'utilisateur trouvé',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        credits: user.credits,
        phone: user.phone,
        role: user.role, // admin / moderator / paysans (user) lol
        tier: user.tier, // Correction : on utilise le champ tier au lieu de l'email
        isVerified : user.isVerified
      },
      //token : token
    });

  } catch (error) {
    //console.log("ici")
    res.status(500).json({ message: error.message });
  }
};


// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) return res.status(409).json({ message: 'CONFLICT : Cet Email est déjà utilisé' });

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      ...rest,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Tentative d'envoi d'email de confirmation
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}/email/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          id: newUser._id
        })
      });

      if (!response.ok) {
        console.log("Échec de l'envoi du mail de confirmation. L'utilisateur a été créé mais devra vérifier son email plus tard.");
        // On continue sans erreur car l'utilisateur est créé
      }
    } catch (emailError) {
      console.error("Erreur lors de l'envoi du mail de confirmation:", emailError);
      // On continue sans erreur car l'utilisateur est créé
    }

    // On renvoie toujours 201 si l'utilisateur est créé, même si l'email échoue
    res.status(201).json(newUser);

  } catch (error) {
    // Cette erreur ne devrait survenir que si la création de l'utilisateur échoue
    res.status(400).json({ message: error.message });
  }
};

//méthode qui serà utiliser pour actuliser l'état "isVerified d'un user"
exports.verifyUserMail = async (req, res) => {

  try {
    // faire une requête vers le auth service pour vérifier si le token est toujours valide
    await fetch(`${process.env.AUTH_SERVICE_URL}/email/verifyToken/${req.params.token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).then(async (authResponse) => {

      if (authResponse.status == 200) {
        // récupérer le token décodé pour obtenir l'id et le mettre dans la requête de changement d'actualisation (findByIdAndUpdate)
        const json = await authResponse.json(); // ✅ On parse la réponse JSON
        const userId = json.user.id;

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { isVerified: true },
          { new: true } // pour retourner l'utilisateur mis à jour
        );

        if (!updatedUser) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.status(200).json({ message: 'Utilisateur vérifié avec succès', user: updatedUser });
      } else {

        res.status(403).json({ message: "La periode de validité de ce mail est expiré" });
      }
    }).catch((err) => {

      res.status(500).json({ message: err.message || "erreur serveur" })
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    console.log(req.body);
    let isAutorized = (req.user.role == "admin" || req.user.role == "moderator" || req.user.id == req.params.id); // depuis le token

    if (!isAutorized) {
      return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autoriser à modifer les informations d'un autre utilisateur" });
    }

    // Si la requête contient un nouveau mot de passe
    if (req.body.newPassword) {
      // Récupérer l'utilisateur pour vérifier son mot de passe actuel
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Vérifier le mot de passe actuel
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Le mot de passe actuel est incorrect" });
      }

      // Hasher le nouveau mot de passe
      req.body.password = await bcrypt.hash(req.body.newPassword, 10);
      // Supprimer les champs supplémentaires pour ne pas les sauvegarder
      delete req.body.newPassword;
      delete req.body.currentPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {

    let isAutorized = (req.user.role == "admin" || req.user.role == "moderator" || req.user.id == req.params.id); // depuis le token

    if (!isAutorized) {
      return res.status(401).json({ message: "Unauthorized : Cet Utilisateur n'est pas autoriser à supprimer un autre utilisateur" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Mettre à jour l'utilisateur
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Retourner l'utilisateur mis à jour
    return res.status(200).json({
      message: "Email vérifié avec succès",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        credits: user.credits,
        phone: user.phone,
        role: user.role,
        tier: user.tier,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: "Token invalide" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Le lien a expiré" });
    }
    console.error('Erreur lors de la vérification de l\'email:', error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getAllUsers: exports.getAllUsers,
  getUserById: exports.getUserById,
  getUserByEmail: exports.getUserByEmail,
  login: exports.login,
  createUser: exports.createUser,
  verifyUserMail: exports.verifyUserMail,
  updateUser: exports.updateUser,
  deleteUser: exports.deleteUser,
  verifyEmail: exports.verifyEmail
};
