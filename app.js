if(process.env.NODE_EN != 'production'){
    require("dotenv").config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ExpressError = require('./utils/ExpressError.js');


const listingRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js'); 
const userRouter = require('./routes/user.js'); 


const session = require('express-session');
const MongoStore = require('connect-mongo');

const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
const methodOverride = require('method-override');
app.use(methodOverride("_method")); 
const ejsMate = require('ejs-mate');
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, 'public')));//static files anevi public folder lo vunnai  avi use cheskodaniki

const dbURL = process.env.ATLAS_URL;

main()
.then(()=>{
    console.log("Mongo database is connected");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbURL);  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE!",err);
})
 
const sessionOptns= {
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookies: {
        expires: Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000, 
        httpOnly: true,
    },
};

app.use(session(sessionOptns));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(8020,()=>{
    console.log("app is listening on port 8020");
});

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.fail = req.flash("fail");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
})



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);





app.all("*", (req, res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})





app.use((err, req, res, next) =>{
    let{statusCode=500,message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
});











