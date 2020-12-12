// Course Schema
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const slugify = require("slugify");
// Bringing asyncHandler
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

const filterCondition = require("../utils/filterCondition");

//          GET REQUEST

// @desc        Get All courses
// @route       GET /api/v1/courses
// @access      Public
exports.getAllCourses = asyncHandler(async (req, res, next) => {
	let courses = await filterCondition(req.params)
	.then(async (data) => {
		console.log(data);
		return await Course.find(data);
	})
	;


	res.status(200).json({
		success: true,
		msg: "Showing all found Courses.",
		count: courses.length,
		data: courses,
	});
});

// @desc        Get a course by slug
// @route       GET /api/v1/courses
// @access      Public
exports.getSingleCourseSlug = asyncHandler(async (req, res, next) => {
	const { slug, bootcampId, bootcampSlug } = req.params;
	let filters;
	if (bootcampSlug) {
		const bootcamp = await Bootcamp.findOne({
			slug: bootcampSlug,
		});
		filters = {
			bootcamp: bootcamp._id,
			slug,
		};
	} else if (bootcampId) {
		filters = {
			bootcamp: bootcampId,
			slug,
		};
	} else {
		filters = {
			slug,
		};
	}

	const course = await Course.findOne(filters);
	if (!course) {
		return next(
			new ErrorResponse(
				`Not Found a Course with the slug of ${slug}!`,
				404
			)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Showing found Course with a slug of ${slug}.`,
		data: course,
	});
});

// @desc        Get a course by slug
// @route       GET /api/v1/courses
// @access      Public
exports.getSingleCourseId = asyncHandler(async (req, res, next) => {
	const { id, bootcampId, bootcampSlug } = req.params;
	let filters;
	if (bootcampSlug) {
		const bootcamp = await Bootcamp.findOne({
			slug: bootcampSlug,
		});
		filters = {
			bootcamp: bootcamp._id,
			_id: id,
		};
	} else if (bootcampId) {
		filters = {
			bootcamp: bootcampId,
			_id: id,
		};
	} else {
		filters = {
			_id: id,
		};
	}
	const course = await Course.findOne(filters);

	if (!course) {
		return next(
			new ErrorResponse(`Not Found a Course with an id of ${id}!`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Showing found Course with an id of ${id}.`,
		data: course,
	});
});

//          POST REQUEST

// @desc        Post a Course
// @route       POST /api/v1/courses
// @access      Public
exports.postCourse = asyncHandler(async (req, res, next) => {
	const { bootcampId, bootcampSlug } = req.params;
	let doc;
	console.log(req.params);
	if (bootcampSlug) {
		const bootcamp = await Bootcamp.findOne({
			slug: bootcampSlug,
		});
		doc = {
			...req.body,
			bootcamp: bootcamp._id,
		};
	} else if (bootcampId) {
		doc = {
			...req.body,
			bootcamp: bootcampId,
		};
	} else {
		doc = req.body;
	}

	const course = await Course.create(doc);
	res.status(200).json({
		success: true,
		msg: "Course Added.",
		data: course,
	});
});

//          DELETE REQUEST

// @desc        Delete a Course
// @route       POST /api/v1/courses
// @access      Private
exports.deleteCourseSlug = asyncHandler(async (req, res, next) => {
	const { slug, bootcampId, bootcampSlug } = req.params;

	let filters;

	if (bootcampSlug) {
		const bootcamp = await Bootcamp.findOne({
			slug: bootcampSlug,
		});
		filters = {
			bootcamp: bootcamp._id,
			slug,
		};
	} else if (bootcampId) {
		filters = {
			bootcamp: bootcampId,
			slug,
		};
	} else {
		filters = {
			slug,
		};
	}

	const course = await Course.deleteOne(filters);

	if (course.deletedCount === 0) {
		return next(
			new ErrorResponse(`Not Found a Course with a slug of ${slug}!`, 404)
		);
	}

	res.status(200).json({
		success: true,
		msg: `Deleted a Course with a slug of ${slug}.`,
	});
});

// @desc        Delete a Course by ID
// @route       POST /api/v1/courses/by-id
// @access      Private
exports.deleteCourseID = asyncHandler(async (req, res, next) => {
	const { id, bootcampId, bootcampSlug } = req.params;
	let filters;
	if (bootcampSlug) {
		const bootcamp = await Bootcamp.findOne({
			slug: bootcampSlug,
		});
		filters = {
			bootcamp: bootcamp._id,
			_id: id,
		};
	} else if (bootcampId) {
		filters = {
			bootcamp: bootcampId,
			_id: id,
		};
	} else {
		filters = {
			_id: id,
		};
	}

	const course = await Course.findOneAndDelete(filters);
	console.log(course);
	if (!course) {
		return next(
			new ErrorResponse(`Not Found a Course with an id of ${id}!`, 404)
		);
	}

	res.status(200).json({
		success: true,
		msg: `Deleted a Course with an id of ${id}.`,
	});
});

//          PUT REQUEST

// @desc        Update a Course by Slug
// @route       POST /api/v1/courses
// @access      Private
exports.updateCourseSlug = asyncHandler(async (req, res, next) => {
	const { slug, bootcampId, bootcampSlug } = req.params;

	let filters;

	if (bootcampSlug) {
		const bootcamp = await Bootcamp.findOne({
			slug: bootcampSlug,
		});
		filters = {
			bootcamp: bootcamp._id,
			slug,
		};
	} else if (bootcampId) {
		filters = {
			bootcamp: bootcampId,
			slug,
		};
	} else {
		filters = {
			slug,
		};
	}

	let newSlug;
	if (req.body.title) {
		newSlug = slugify(req.body.title, {
			lower: true,
		});
	} else {
		newSlug = slug;
	}

	const course = await Course.updateOne(
		filters,
		{
			...req.body,
			slug: newSlug,
		},
		{
			new: true,
			runValidators: true,
		}
	);
	console.log(course);
	if (course.nModified === 0) {
		return next(
			new ErrorResponse(`Not Found a Course with a slug of ${slug}!`, 404)
		);
	}
	const found = await Course.findOne({
		slug: newSlug,
	});
	res.status(200).json({
		success: true,
		msg: `Updated a Course with a slug of ${slug}.`,
		data: found,
	});
});

// @desc        Update a Course by ID
// @route       POST /api/v1/courses
// @access      Private
exports.updateCourseID = asyncHandler(async (req, res, next) => {
	const { id, bootcampId } = req.params;

	let slug;
	let doc;

	if (req.body.title) {
		slug = slugify(req.body.title, {
			lower: true,
		});
		doc = {
			...req.body,
			slug,
		};
	} else {
		doc = {
			...req.body,
		};
	}

	let filters = {
		bootcamp: bootcampId,
		_id: id,
	};

	console.log(req.params);
	if (!bootcampId) {
		filters = {
			_id: id,
		};
	}

	const course = await Course.findOneAndUpdate(filters, doc, {
		new: true,
		runValidators: true,
	});

	if (!course) {
		return next(
			new ErrorResponse(`Not Found a Course with an id of ${id}!`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Updated a Course with an id of ${id}.`,
		data: course,
	});
});
