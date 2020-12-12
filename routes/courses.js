//Bringing express
const express = require("express");

// router instance
const router = express.Router({mergeParams: true});


// Bringing all controllers from courses controller
const { 
    // GET controllers
    getAllCourses, 
    getSingleCourseSlug,
    getSingleCourseId,

    // POST controllers
    postCourse,
    
    // DELETE controllers
    deleteCourseSlug,
    deleteCourseID,
    
    // UPDATE controllers
    updateCourseSlug,
    updateCourseID,

} = require("../controllers/courses");


// finally course routes:

//Essential
router.route("/")
.get(getAllCourses)
.post(postCourse);

//By SLug
router.route("/:slug")
.get(getSingleCourseSlug)
.delete(deleteCourseSlug)
.put(updateCourseSlug);

//By ID
router.route("/by-id/:id")
.get(getSingleCourseId)
.delete(deleteCourseID)
.put(updateCourseID);

module.exports = router;
