const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, reviewAuth } = require('../middleware'); //import middleware for validating reviews and authors
const catchAsync = require('../utils/catchAsync'); //a function wrapper used to catch exceptions in async functions.
const reviewController = require('../controllers/reviews');
//const Campground = require('../models/campground');  //Model for campgrounds used in the app.
//const Review = require('../models/review.js'); //model for camground reviews
//const ExpressError = require('../utils/ExpressError'); //custom error class for app.

router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.create));

router.delete('/:reviewId', isLoggedIn, reviewAuth, catchAsync(reviewController.delete));

module.exports = router;