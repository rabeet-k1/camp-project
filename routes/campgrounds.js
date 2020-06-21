var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');

var multer = require('multer');
var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function(req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

//  INDEX - Show All Campgrounds
router.get('/', function(req, res) {
	var noMatch = null;
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({ name: regex }, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				if (allCampgrounds.length < 1) {
					noMatch = 'No Campgrounds Match That Query, Please Try Again';
				}
				res.render('campgrounds/index', {
					campData: allCampgrounds,
					page: 'campgrounds',
					noMatch: noMatch
				});
			}
		});
	} else {
		Campground.find({}, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render('campgrounds/index', {
					campData: allCampgrounds,
					page: 'campgrounds',
					noMatch: noMatch
				});
			}
		});
	}
});

// CREATE - Add New Campground To DB
router.post('/', middleware.isLoggedIn, upload.single('image'), function(req, res) {
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		// add cloudinary url for the image to the campground object under image property
		if(err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		req.body.campground.image = result.secure_url;
		req.body.campground.imageId = result.public_id;
		// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		};
		Campground.create(req.body.campground, function(err, campground) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.redirect('/campgrounds/' + campground.id);
		});
	});
});

// NEW - Show Form To Create New Campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campgrounds/new');
});

// SHOW -  shows more info about one campground
router.get('/:id', function(req, res) {
	console.log(req.params.id);
	Campground.findById(req.params.id)
		.populate('comments')
		.exec(function(err, foundCampground) {
			if (err || !foundCampground) {
				req.flash('error', 'Campground not Found');
				res.redirect('back');
			} else {
				console.log(foundCampground);
				res.render('campgrounds/show', { campData: foundCampground });
			}
		});
});

// EDIT Campground Route
router.get('/:id/edit', middleware.checkCampgroundOwnerShip, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

// UPDATE Campground Route
router.put('/:id', middleware.checkCampgroundOwnerShip, upload.single("image"), function(req, res) {
	// 	Find and Update the Correct Campground
	Campground.findById(req.params.id, async function(err, campground) {
		if (err) {
			req.flash("error", err.message);
			res.redirect('back');
		} else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } 
			  catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.campground.name;
			campground.cost = req.body.campground.cost;
            campground.description = req.body.campground.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
	});
	// 	Redirect Somewhere(show page)
});

// Destroy Campground Route
router.delete('/:id', middleware.checkCampgroundOwnerShip, function(req, res) {
	Campground.findById(req.params.id, async function(err, campground) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		} 
		try {
			await cloudinary.v2.uploader.destroy(campground.imageId);
			campground.remove();
			req.flash("success", "Campground Deleted Successfully")
			res.redirect("/campgrounds");
		}
		catch (err) {
			if(err) {
			req.flash("error", err.message);
			return res.redirect("back");
			}
		}
	});
});

// Fuzzy Search Regular Expression Escapse Function
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;