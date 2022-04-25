const express = require('express');
const router = express.Router();
const campController = require('../controllers/campgrounds'); //Application logic for campground ineractions
const catchAsync = require('../utils/catchAsync'); //a function wrapper used to catch exceptions in async functions.
const { isLoggedIn, validateCampground, campAuth } = require('../middleware.js'); //import middleware functions
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')  //catches all requests coming into '/campgrounds'
    .get(catchAsync(campController.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campController.create));

// 'new' must be placed above '/:id' so new in the url is caught separately.
router.get('/new', isLoggedIn, campController.new);

router.route('/:id')  //like above router.route can catch all requests coming into campgrounds/:id
    .get(catchAsync(campController.show))
    .put(isLoggedIn, campAuth, upload.array('image'), validateCampground, catchAsync(campController.update))
    .delete(isLoggedIn, campAuth, catchAsync(campController.delete));

router.get('/:id/edit', isLoggedIn, campAuth, catchAsync(campController.edit));

module.exports = router;