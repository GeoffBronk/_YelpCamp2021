const Campground = require('../models/campground');  //Model for campgrounds used in the router.
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  //used to create geocoding coords for locations.
const geocoder = mbxGeocoding({accessToken: process.env.MAPBOX_TOKEN});
const { cloudinary } = require("../cloudinary"); //cloudinary object used for image storage management

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.new = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.create = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCampgground = new Campground(req.body.campground); //non-secure but simple way to add info from body to DB model for saving
    newCampgground.geometry = geoData.body.features[0].geometry;
    //req.files has the possibilty of being an array of image info, map function creates an array out of an array
    newCampgground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampgground.author = req.user._id; //save campground author to db with new campground
    await newCampgground.save(); //save new campgground
    req.flash('success', 'New Campground Created'); //message user for successful creation of campground.
    res.redirect(`/campgrounds/${newCampgground._id}`); //redirect to new campground show page.
};

module.exports.show = async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); //use id sent in through request to find camp in DB and return for rendering
    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground }); //render show page for campground found in DB
};

module.exports.edit = async(req, res) => {
    const { id } = req.params; //destructure id from url params object
    const campground = await Campground.findById(id); //use id sent in through url to find camp in DB and return for rendering
    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground }); //render show page for camp found in DB
};

module.exports.update = async(req, res) => {
    const { id } = req.params; //destructure id from url params object
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); //use id sent in through url to find camp in DB and return for rendering
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); //add new images to image array for campground
    await campground.save(); //save any new image data
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Campground Updated Successfully');
    res.redirect(`/campgrounds/${campground._id}`); //redirect to edited campground show page.
};

module.exports.delete = async(req, res) => {
    const { id } = req.params; //destructure id from url params object
    await Campground.findByIdAndDelete(id); //use id sent in through url to find camp in DB and return for rendering
    req.flash('success', 'Campground Successfully Deleted');
    res.redirect(`/campgrounds`); //redirect to edited campground show page.
};