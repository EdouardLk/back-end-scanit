router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/verify/:token', userController.verifyEmail); 