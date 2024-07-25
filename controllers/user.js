
const User = require('../models/user.js');

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}
module.exports.registerUser = async(req, res) => {
    try{
        let {username, password, email} = req.body;
    const newUser = new User({username, email});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.logIn(registeredUser    ,(err, next) => {
        if (err) {
            next(err);
        }
        req.flash('success',"Welcome to WanderLust");
        res.redirect("/listings");
    }) 
    } catch(e){
        req.flash('error', e.message);
        res.redirect("/signup");

    }
}

module.exports.showLoginForm = (req, res) =>{
    res.render("users/login.ejs");
}

module.exports.userRegistered = async(req,res)=>{
    req.flash("success", "Welcome to WanderLust! You are now logged in successfully!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

}

module.exports.logout = (req, res, next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Now , you are logged out!");
        res.redirect("/listings");
    });
}