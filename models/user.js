const mongoose = require('mongoose');//mongoose required here for schema creation.
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

//create new mongoose schema containing required fields and thier properties
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);  //using pligin() with passportLocalMongoose will add usernam and password to model.

//export compiled mongoose model from module based on schema for use in app.
module.exports = mongoose.model('User', UserSchema);