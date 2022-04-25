const mongoose = require('mongoose');//mongoose required here for schema creation.
const Schema = mongoose.Schema;

//create new mongoose schema containing required fields and thier properties
const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

//export compiled mongoose model from module based on schema for use in app.
module.exports = mongoose.model('Review', ReviewSchema);