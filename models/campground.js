const mongoose = require('mongoose');//mongoose required here for schema creation.
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

//create new mongoose schema containing required fields and thier properties
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
}, opts);

//the virtual below is used by mapBox for the pop up on the cluster map for an individual campgrounds
CampgroundSchema.virtual('properties.popUpHtml').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

//This will only trigger with the specific method we are using to remove a campground from the DB.
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id: { $in: doc.reviews}
        });
    }
});

//export compiled mongoose model from module based on schema for use in app.
module.exports = mongoose.model('Campground', CampgroundSchema);