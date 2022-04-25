//check if running in production or development mode for environment variables
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config(); //loads .env file contents into process.env
}

const express = require('express');
const app = express();
const path = require('path'); //library used to combine directory paths
const mongoose = require('mongoose'); //base mongoose app for MongoDB operations.
const ejsMate = require('ejs-mate'); //tool for defining boilerplate html/css for insertion into ejs code
const session = require('express-session'); //library used for managing user sessions.
const flash = require('connect-flash');  //library used for showing flash messages to users
const ExpressError = require('./utils/ExpressError'); //custom error class for app.
const methodOverride = require('method-override'); //mathod override library for overriding HTTP verbs in url string
const passport = require('passport'); //passport and passport local are libraries for user management,
const localStrategy = require('passport-local'); // local means users are stored in local server DB instead of an Amazon user, etc.
const User = require('./models/user'); //bring in user model for passport config
const helmet = require('helmet');  //security middleware for hacker prevention
const mongoSanitize = require('express-mongo-sanitize');//library used to prevent Mongo injection
const MongoStore = require('connect-mongo')(session);

//routes defined in routes directory added to app for use.
const userRoutes = require('./routes/users');
const campRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

//connects to a local mongoose database named yelp-camp (mongoose service must be running)
//const dbUrl = 'mongodb://localhost:27017/yelp-camp';

//Use MongoDb Atlas database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, { 
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true 
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);//library for enhancing EJS capabilities
app.set('views', path.join(__dirname, 'views')); //set views directory path
app.set('view engine', 'ejs'); //tells express that EJS files will be used for views

app.use(express.urlencoded({ extended: true })); //use badyparser middleware - info in request.body available in post/put requests.
app.use(methodOverride('_method')); //sets the parameter that will be used in url for orerriding HTTP verb
app.use(express.static( path.join(__dirname, 'public'))); //set the public directory as a static repository for our app.
app.use(mongoSanitize({
    replaceWith: '_'
})); 

const store = new MongoStore({
    url: dbUrl,
    secret: 'thisneedstobeabettersecret!',
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
});

const sessionConfig = {
    store,
    name: 'Yelpcamp.session',
    secret: 'thisneedstobeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, needed for deployed website
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig)); //sets up sessions for use in app.  MUST BE BEFORE PASSPORT.SEESION USE
app.use(flash());  //sets up flash for use in app

//use default helmet security policy 
//app.use(helmet());

// This disables the `contentSecurityPolicy` middleware but keeps the rest.
// app.use(
//     helmet({
//         contentSecurityPolicy: false,
//     })
// );

//variables used to define where scripts to be run by application can come form
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
];
const fontSrcUrls = [];

//sets helmet security policy so 3rd party scripts, fonts and images can only load from trusted sources, stc.
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/geoffbronk/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize()); //initialize passport with app
app.use(passport.session());  //set up passport session for use in app.
passport.use(new localStrategy(User.authenticate())); //sets up local strategy with user model info using passport

passport.serializeUser(User.serializeUser());  //defines what method to use for serializing and deserializing user info
passport.deserializeUser(User.deserializeUser());

//this runs for every request and adds 3 items to the olcals collection
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//Set up routers for use in the app
app.use('/', userRoutes);
app.use('/campgrounds', campRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.get('/', (req, res) => {
    res.render('home');
});

//route handler for user that go to undefined routes 404 handler
app.all('*', (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

//base error handler
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = "Internal Application Error Encountered."
    res.status(statusCode).render('error', { err });
});


app.listen(3000, () => {
    console.log('Serving Yelpcamp on port 3000');
});