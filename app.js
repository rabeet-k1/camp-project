	              require("dotenv").config();
var express 	= require("express"),
 	app      	= express(),
 	bodyParser 	= require("body-parser"),
 	mongoose 	= require("mongoose"),
	flash       = require("connect-flash"),
	passport    = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	Campground 	= require("./models/campground"),
	Comment 	= require("./models/comment"),
	User        = require("./models/user"),
	seedDB     	= require("./seeds");

// Requiring Routes
var campgroundRoutes = require("./routes/campgrounds"),
	commentRoutes 	 = require("./routes/comments"),
	authRoutes	     = require("./routes/index");

mongoose.connect('mongodb://localhost:27017/yelp_camp_final', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// seedDB();  Seed the Database
	

// Require Moment JS
app.locals.moment = require('moment');

// Passport Configuration
app.use(require("express-session")({
	secret: "Once Again Rusty is the cutest Dog",
	resave: false,
	saveUninitialized: false
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})


app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);



app.listen(3000, function () {
	console.log("The YelpCamp Server Has Started");	
})