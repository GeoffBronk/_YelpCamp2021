const ExpressError = require('./utils/ExpressError'); //custom error class for app.
const { campgroundSchema, reviewSchema } = require('./schemas.js');  //file containing Joi schemas for server side validation.
const Campground = require('./models/campground');  //Model for campgrounds used in the router.
const Review = require('./models/review.js'); //model for camground reviews

module.exports.isLoggedIn = (req, res, next) => {    
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Log in required for this action.');
        return res.redirect('/login');
    }
    next();
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg)
    } else {
        next();
    }
}

module.exports.campAuth = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) { //check if user that made request is campground owner
        req.flash('error', "You don't have permission to perform this action.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg)
    } else {
        next();
    }
}

module.exports.reviewAuth = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) { //check if user that made request is campground owner
        req.flash('error', "You don't have permission to perform this action.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}