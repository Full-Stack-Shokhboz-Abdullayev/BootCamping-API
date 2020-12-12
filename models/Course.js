const mongoose = require("mongoose");

const slugify = require("slugify");

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		min: [5, "Course Title can't be less than 5 characters!"],
		max: [50, "Course Title can't be more than 50 characters!"],
        required: [true, "Please, enter Course Title!"],
        unique: [true, "Course title should be unique!"]
	},
	description: {
		type: String,
		min: [20, "Course Description can't be less than 5 characters!"],
		max: [500, "Course Description can't be more than 500 characters!"],
		required: [true, "Please, enter Course Description!"],
	},
	weeks: Number,
	tuition: {
		type: Number,
		required: [true, "Course needs tuition cost!"],
	},
	slug: {
		type: String,
	},
	minimumSkill: {
		type: String,
		enum: ["Beginner", "Intermediate", "Advanced"],
		required: [true, "Course needs minimum skill!"],
	},
	scholarshipsAvailable: {
		type: Boolean,
		default: false,
	},
	addedAt: {
		type: Date,
		default: Date.now
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true,
	}
});

CourseSchema.pre("save", function (next) {
	const sluggesTitle = slugify(this.title, {
		lower: true,
	});

	this.slug = sluggesTitle;

	console.log("Slugify ran:", this.slug);

	next();
});

module.exports = mongoose.model("Course", CourseSchema);
