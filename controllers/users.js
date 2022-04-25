const User = require('../models/user');

module.exports.register = (req, res) => {
    res.render('users/register');
};

module.exports.create = async(req, res) => {
    try{
        const {email, username, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelpcamp!');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.loginForm = (req, res) => {
    res.render('users/login');
};

module.exports.login = async(req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Log out successful.');
    res.redirect('/campgrounds');
};

