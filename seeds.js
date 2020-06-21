var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
	{
	name: "Cloud's Rest",
	image: "https://media-cdn.tripadvisor.com/media/photo-s/13/b8/8a/28/olakira-camp-asilia-africa.jpg",
	description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
	},
	{
	name: "Desert Mesa",
	image: "https://thegrowcery.co.za/wp-content/uploads/sites/17/2017/05/The-growcery-Camp-Orange-River1.jpg",
	description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
	},
	{
	name: "canyon Floor",
	image: "https://www.camppontiac.com/images/img-5.jpg",
	description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
	},
]

function seedDB () {
	// Remove All Campgrounds 	
	Campground.deleteMany({}, function (err) {
		if (err) {
			console.log(err);	
		}
		console.log("Remove Campgrounds!");
		// Add A Few Campgrounds
	
		data.forEach(function(seed) {
			Campground.create(seed, function(err, campground) {
				if(err) {
					console.log(err);
				}
				else {
					console.log("added a Campground");
					// Create a Comment
					Comment.create({
						text: "This Place is great, but I really love Kashmir",
						author: "Rabeet"
					}, function (err, comment) {
						if(err) {
							console.log(err);
						}
						else {
							campground.comments.push(comment);
							campground.save();
							console.log("Created Comment")
						}
					})
				}
			})	
		})
	})
	// Add A Few Comments 	
}


module.exports = seedDB;
