// Bringing Router
const express = require("express");
const router = express.Router();

// Bringing controllers / views
const {
	getBootcamps,
    getSingleBootcamp,
    getBootcampBySlug,
    getBootcampsByLocation,
    updateBootcamp,
    deleteBootcamp,
    postBootcamp
} = require("../controllers/bootcamps");

const courses = require('./courses');

router.use("/by-id/:bootcampId/courses", courses)
//route handling for bootcamps

// Essential routes without ID
router.route('/')
.get(getBootcamps)
.post(postBootcamp)

// Routes with ID
router.route('/by-id/:id')
.get(getSingleBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp)

// Router to get the bootcamps by ZIPCODE and DISTANCE
router.route('/by-location/:zipcode/:distance')
.get(getBootcampsByLocation)

//Get a bootcamp by slug
router.route('/:slug')
.get(getBootcampBySlug)

router.use("/:bootcampSlug/courses", courses)


module.exports = router;
