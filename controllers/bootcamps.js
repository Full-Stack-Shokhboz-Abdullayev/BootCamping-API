const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

// @desc        Get All bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	// Switchable variable for figuring bootcamps by queries
	let query;

	// Copy of req.query to exclude some fields
	const reqQuery = { ...req.query };

	// keys to be excluded from query copy on the top
	const keysToExclude = ["select", "sort", "limit", "page"];

	// Loop over keysToExclude and delete them from reqQuery
	keysToExclude.forEach((param) => delete reqQuery[param]);

	// Object to string
	let queryStr = JSON.stringify(reqQuery);

	// Check sorted query
	console.log(reqQuery);

	// From gt, lt, gte, lte, in; To $gt, $lt, $gte, $lte, $in;
	queryStr = queryStr.replace(
		/\b(gt|lt|gte|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Parse string result into Object
	queryStr = JSON.parse(queryStr);

	// Check if queryStr is not empty
	// If so then return all bootcamps
	query = Bootcamp.find(queryStr);

	//check if select exists in req.query
	//If so then turn ',' to ' '
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		// Specific mongoose selection for field
		// Really awesome
		query = query.select(fields);
	}

	//Pagination

	// Specific mongoose selection for field
	// Really awesome
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit
	const total = await Bootcamp.countDocuments()
	query.skip(startIndex).limit(limit);

	

	//check if sort exists in req.query
	//if so then sort the bootcamps
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-addedAt");
	}
	// Finally Assign and Await sorted/all bootcamps
	const bootcamps = await query;

	//Pagination result
	const pagination = {}

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit
		}
	}

	if(startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit
		}
	}
	//send response
	res.status(200).json({
		success: true,
		msg: "Showing All Found Bootcamps",
		pagination,
		count: bootcamps.length,
		data: bootcamps,
	});
});

// @desc        Get a single bootcamp by id
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const bootcamp = await Bootcamp.findById(id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with an id of ${id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Showing a Bootcamp with an id of ${id}`,
		data: bootcamp,
	});
});

// @desc        Get a single bootcamp by slug
// @route       GET /api/v1/bootcamps/:slug
// @access      Public
exports.getBootcampBySlug = asyncHandler(async (req, res, next) => {
	const { slug } = req.params;

	const bootcamp = await Bootcamp.findOne({
		slug: slug,
	});

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with a slug of ${slug}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Showing a Bootcamp with a name of '${bootcamp.name}'`,
		data: bootcamp,
	});
});

// @desc        Get bootcamps by location
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Public
exports.getBootcampsByLocation = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(zipcode);
	const { longitude, latitude } = loc[0];

	//Calc radius using radians
	// Divide dist by radius of Earth
	const EARTH_RADIUS_KM = 6378.1;
	const radius = distance / EARTH_RADIUS_KM;

	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: {
				$centerSphere: [[longitude, latitude], radius],
			},
		},
	});
	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});

// @desc        Post new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.postBootcamp = asyncHandler(async (req, res, next) => {
	const newBootcamp = await Bootcamp.create(req.body);

	res.status(201).json({
		success: true,
		msg: "Bootcamp was added successfuly.",
		data: newBootcamp,
	});
});

// @desc        Delete a bootcamp by id
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const bootcamp = await Bootcamp.findByIdAndDelete(id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with an id of ${id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Deleted a Bootcamp with an id of ${id}`,
		data: {},
	});
});

// @desc        Update a bootcamp by id
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const { name, address } = req.body;
	let bootcamp;

	if (name || address) {
		if (name && address) {
			const loc = await geocoder.geocode(address);
			const {
				longitude,
				latitude,
				streetName,
				country,
				zipcode,
				city,
			} = loc[0];
			const location = {
				type: "Point",
				coordinates: [longitude, latitude],
				streetName,
				country,
				city,
				zipcode,
			};
			bootcamp = await Bootcamp.findByIdAndUpdate(
				id,
				{
					...req.body,
					slug: slugify(name, {
						lower: true,
					}),
					location: location,
				},
				{
					new: true,
					runValidators: true,
				}
			);
		} else if (name) {
			bootcamp = await Bootcamp.findByIdAndUpdate(
				id,
				{
					...req.body,
					slug: slugify(name, {
						lower: true,
					}),
				},
				{
					new: true,
					runValidators: true,
				}
			);
		} else {
			const loc = await geocoder.geocode(address);
			const {
				longitude,
				latitude,
				streetName,
				country,
				zipcode,
				city,
			} = loc[0];
			const location = {
				type: "Point",
				coordinates: [longitude, latitude],
				streetName,
				country,
				city,
				zipcode,
			};
			bootcamp = await Bootcamp.findByIdAndUpdate(
				id,
				{
					...req.body,
					location,
				},
				{
					new: true,
					runValidators: true,
				}
			);
		}
	} else {
	}
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with an id of ${id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Updated a Bootcamp with an id of ${id} and a name of ${bootcamp.name}`,
		data: bootcamp,
	});
});
