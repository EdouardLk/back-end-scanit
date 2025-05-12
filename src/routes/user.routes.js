const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authenticateToken = require('../middlewares/auth.middleware');

// Routes CRUD pour les utilisateurs
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.get('/byEmail/:email', userController.getUserByEmail);

router.post('/login', userController.login); //route à appeler seulement depuis AuthService !!
router.post('/create', userController.createUser); //register

router.put('/:id', authenticateToken, userController.updateUser);

router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
