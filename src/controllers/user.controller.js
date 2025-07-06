const User = require("../models/user.model");
const bcrypt = require('bcrypt');

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

    // CORRECTION : Il est important d'inclure l'email ici, sinon on aurait l'erreur
    // "users validation failed: email: Path `email` is required"
    const newUser = new User({
      ...rest,
      email,
      password: hashedPassword
    });

    //console.log('user : ' + newUser);

    await newUser.save();    

    //Maintenant gestion de l'envoi d'un mail de confirmation de compte
    if (newUser) {      
      
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}/email/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email : newUser.email,
          id : newUser._id
        })
      });

      if (!response.ok) {
        console.log("Echec de la requête vers le auth service");
        throw new Error(`Response status: ${response.status}`);
      } else {

        console.log(response.message);
      }
    }

    res.status(201).json(newUser);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//méthode qui serà utiliser pour actuliser l'état "isVerified d'un user"
exports.verifyUserMail = async (req, res) => {
  // faire une requête vers le auth service pour vérifier si le token est toujours valide

  try {

    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/email/verifyToken`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${req.body}` },
      //body: JSON.stringify({})
      // récupéré le token décodé pour le obtenir l'id et le mettre dans la requête de changement de statut
    });

    if (!response.ok) {
      // si non alors , on s'occupe , mentionner que la periode de validité du mail est expiré
      res.status(401).json({ message: "la periode de validité de ce mail est expiré" })
      //console.log("ici");
      throw new Error(`Response status: ${response.status}`);
    } else {
      //si oui alors actualise le is verified a true
      console.log(response.data);
      // const updatedUser = await User.findByIdAndUpdate(
      //   userId,
      //   { isVerified: true },
      //   { new: true } // pour retourner l'utilisateur mis à jour
      // );

      // if (!updatedUser) {
      //   return res.status(404).json({ message: 'Utilisateur non trouvé' });
      // }

      res.status(200).json({ message: 'Utilisateur vérifié avec succès', user: updatedUser });

    }


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
