const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please, add a name!"],
		trim: true,
		unique: true,
		maxlength: [50, "Name can't be longer than 50 characters."],
	},
	slug: String,
	description: {
		type: String,
		required: [true, "Please, add a description!"],
		maxlength: [500, "Description can't be longer than 250 characters."],
	},
	website: {
		type: String,
		match: [
			/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
			"Please enter a real website with HTTP or HTTPS protocol!",
		],
	},
	email: {
		type: String,
		match: [
			/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
			"Please enter a valid email!",
		],
	},
	address: {
		type: String,
		required: [true, "Please enter your address."],
	},
	location: {
		//GeaJSON Point
		type: {
			type: String,
			enum: ["Point"],
			// required: true
		},
		coordinates: {
			type: [Number],
			// required: true,
			index: "2dsphere",
		},
		streetName: String,
		city: String,
		zipcode: String,
		country: String,
	},
	careers: {
		type: [String],
		required: [true, "Please select the one of careers!"],
		enum: [
			"Web Development",
			"Mobile Development",
			"Desktop Development",
			"UI/UX",
			"Data Science",
			"Business",
			"Other",
		],
	},
	averageRating: {
		type: Number,
		min: [1, "Rating must be at least 1!"],
		max: [10, "Rating can't be more than 10!"],
	},
	averageCost: Number,
	photo: {
		type: String,
		default: "no-photo.jpg",
	},
	housing: {
		type: Boolean,
		default: false,
	},
	jobAssistance: {
		type: Boolean,
		default: false,
	},
	jobGuarantee: {
		type: Boolean,
		default: false,
	},
	acceptGi: {
		type: Boolean,
		default: false,
	},
	addedAt: {
		type: Date,
		default: Date.now,
	},
});

// Geocode Implementation
// BootcampSchema.pre("save", async function (next) {
// 	const loc = await geocoder.geocode(this.address);
// 	console.log(loc);
// 	const {
// 		longitude,
// 		latitude,
// 		streetName,
// 		country,
// 		zipcode,
// 		city
// 	} = loc[0];
// 	this.location = {
// 		type: "Point",
// 		coordinates: [longitude, latitude],
// 		streetName,
// 		country,
// 		city,
// 		zipcode
// 	};
// 	console.log("Zipcode ran:", this.location);
// 	next();
// });
BootcampSchema.pre("save", async function (next) {
	const loc = await geocoder.geocode(this.address);
	const {
		longitude,
		latitude,
		streetName,
		country,
		zipcode,
		city
	} = loc[0];
	this.location = {
		type: "Point",
		coordinates: [longitude, latitude],
		streetName,
		country,
		city,
		zipcode
	};

	
	this.slug = slugify(this.name, {
		lower: true,
	});
	console.log("Slugify ran:", this.slug);

	// Geocode Implementation

	next();
});


module.exports = mongoose.model("bootcamp", BootcampSchema);
