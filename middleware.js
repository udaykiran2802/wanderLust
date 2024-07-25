const Review = require('./models/review');
const Listing = require('./models/listing');
const { listingSchema } = require('./schema.js');
const ExpressError = require('./utils/expressError.js');
const { reviewSchema} = require('./schema.js'); // for sever side validation
// const ExpressError = require('../utils/expressError.js');



module.exports.isLogggedin = (req, res, next) =>{
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error',"You dont have an account!, please register an account");
        res.redirect("/signup");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner =async (req, res, next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You dont have permission to DO SO! Becuz You are not the Owner!!");
       return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    console.log(error);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Pass error to next middleware
    } else { 
        next();
    }
};


module.exports.validateReview = (req, res,next) =>{
    let {error}= reviewSchema.validate(req.body);
    if (error){
        let errMsg = error.details.map((el)=>el.message).join(",");  
        throw new ExpressError(400, errMsg); 
    }else{
        next();
    }
}

module.exports.isReviewAuthor =async (req, res, next)=>{
    let { reviewId, id } = req.params;
    let review = await Review.findById(reviewId);
    if(res.locals.currUser&&!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You dont have permission to DO SO! Becuz You are not the Author!!");
       return res.redirect(`/listings/${id}`);
    }
    next();
}