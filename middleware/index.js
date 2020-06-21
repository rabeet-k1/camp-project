var Campground = require("../models/campground");
var Comment = require("../models/comment")
// All the Middleware goes Here
var middlewareObj = {};


middlewareObj.checkCampgroundOwnerShip = function (req, res, next) {
	if(req.isAuthenticated()) {
		Campground.findById(req.params.id, function (err, foundCampground) {
			if(err || !foundCampground) {
				req.flash("error", "Campground not Found");
				res.redirect("back");
			}
			else {
				// console.log(foundCampground.author.id);
				// console.log(req.user._id);
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				}
				else {
					req.flash("error", "You don't have Permission to do that");
					res.redirect("/campgrounds/" + req.params.id);
				}
			}
		})	
	}
	else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}


middlewareObj.checkCommentOwnerShip = function (req, res, next) {
	if(req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function (err, foundComment) {
			if(err || !foundComment) {
				req.flash("error", "Comment not Found");
				res.redirect("back");
			}
			else {
				// console.log(foundComment.author.id);
				// console.log(req.user._id);
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				}
				else {
					req.flash("error", "You don't have Permission to do That");
					res.redirect("/campgrounds/" + req.params.id);
				}
			}
		})	
	}
	else {
		req.flash("error", "You need to be logged in to do That");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function (req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do That");
	res.redirect("/login")
}

module.exports = middlewareObj;