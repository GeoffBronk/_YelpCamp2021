const Campground = require('../models/campground');  //Model for campgrounds used in the app.
const Review = require('../models/review.js'); //model for camground reviews

module.exports.create = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; //Save user info for author validation.
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'New Review of Campground Created');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async(req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review of Campground Deleted');
    res.redirect(`/campgrounds/${id}`);
};