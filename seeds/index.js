const mongoose = require('mongoose');
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  //used to create geocoding coords for locations.
// const geocoder = mbxGeocoding({accessToken: 'pk.eyJ1IjoiZ2VvZmZicm9uayIsImEiOiJja3lhOWtvdGYwM2N0MzBsZHUyZ3dqZDAwIn0.iIMRU8_e8xyCZv5H1SrzZQ'});
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true 
})

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  "url": "https://res.cloudinary.com/geoffbronk/image/upload/v1641222333/YelpCamp2021/gzq6sutaihsvyksy390m.jpg",
                  "filename": "YelpCamp2021/gzq6sutaihsvyksy390m"
                },
                {
                  "url": "https://res.cloudinary.com/geoffbronk/image/upload/v1641222333/YelpCamp2021/pw8oa9jx6rrs9xp8lmst.webp",
                  "filename": "YelpCamp2021/pw8oa9jx6rrs9xp8lmst"
                }
            ],
            author: '618beeab21ca853ba4ac2e76',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis aperiam nisi nulla temporibus consectetur animi, ratione, non possimus aspernatur officiis perspiciatis eius ea iure consequuntur! Corporis cupiditate voluptates consequatur architecto.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
        })
        // const geoData = await geocoder.forwardGeocode({
        //     query: camp.location,
        //     limit: 1
        // }).send()
        // camp.geometry = geoData.body.features[0].geometry;
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

