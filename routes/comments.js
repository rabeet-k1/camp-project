var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Comments New
router.get("/new", middleware.isLoggedIn, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if(err) {
			console.log(err);
		}
		else {
			res.render("comments/new", {campground: campground});	
		}
	})
})

// Comments Create
router.post("/", middleware.isLoggedIn, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		}
		else {
			Comment.create(req.body.comment, function (err, comment) {
				if (err) {
					console.log(err);
				}
				else {
					// Add Username and Id to Comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// Save Comment	
					comment.save();
					console.log("New Comment's username will be: " + req.user.username)
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					req.flash("success", "Successfully added Comment");
					res.redirect("/campgrounds/" + campground._id)
				}
			})
		}
	})
})

// Comment Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnerShip, function (req, res) {
	Campground.findById(req.params.id, function (err, foundCampground) {
		if(err || !foundCampground) {
			req.flash("error", "No Campground Found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function (err, foundComment) {
			if(err) {
				res.redirect("back");
			}
			else {
				res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});

			}
		})
	})
})

// Update Comment Route

router.put("/:comment_id", middleware.checkCommentOwnerShip, function (req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedCommemt) {
		if(err) {
			res.redirect("back");
		}
		else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})


// Destroy Comment Route
router.delete("/:comment_id", middleware.checkCommentOwnerShip, function (req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if(err) {
			res.redirect("back");
		}
		else {
			req.flash("success", "Comment Deleted");
			res.redirect("/campgrounds/" + req.params.id)
		}
	})
})

module.exports = router;