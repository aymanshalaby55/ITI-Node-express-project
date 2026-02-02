const express = require('express');
const usersController = require('../controllers/user.controller');
const schemas = require('../schema/user');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authentication');
const restrictTo = require('../middleware/restrictTo');
const router = express.Router();


router.post('/signup', validate(schemas.createUserSchema), usersController.signup);
router.post('/login', validate(schemas.loginSchema), usersController.login);

// create user
// get all users
router.use(authenticate);


router.get('/', restrictTo('admin'), validate(schemas.getAllUsersSchema), usersController.getAllUsers);


// get user by id
router.get('/:id', usersController.getUserById);

// update user by id
router.patch('/:id', restrictTo("admin"), validate(schemas.updateUserSchema), usersController.updateUserById);


// delete user by id
router.delete('/:id', usersController.deleteUserById);


module.exports = router;