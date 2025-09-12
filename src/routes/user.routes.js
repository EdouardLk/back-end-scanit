const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const sanitizeHtml = require('../middlewares/sanitize.middleware');
const authenticateToken = require('../middlewares/auth.middleware');

// Routes CRUD pour les utilisateurs
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.get('/byEmail/:email', userController.getUserByEmail);
router.get('/email/confirm/:token', userController.verifyUserMail);
router.get('/verify/:token', userController.verifyEmail);

router.post('/login',sanitizeHtml, userController.login); //route à appeler seulement depuis AuthService !!
router.post('/create', sanitizeHtml, userController.createUser); //register

router.put('/buyCredits', authenticateToken, userController.addCredits); // Achats de crédits
router.put('/:id', sanitizeHtml ,authenticateToken, userController.updateUser);

router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
