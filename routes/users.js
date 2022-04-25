const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const userController = require('../controllers/users');
const User = require('../models/user');

router.route('/register')
    .get(userController.register)
    .post(catchAsync(userController.create));

router.route('/login')
    .get(userController.loginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), userController.login);

router.get('/logout', userController.logout);

module.exports = router;