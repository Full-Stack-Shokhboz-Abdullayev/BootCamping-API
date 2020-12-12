const mongoose = require("mongoose");
const Course = require("./models/Course");
const fs = require("fs");
const colors = require("colors");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

const courses = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

async function importData() {
	try {
		console.log("Importing Data...".green.inverse);
		await Course.create(courses);
		process.exit()
	} catch (err) {
		console.log(err);
	}
}
async function deleteData() {
	try {
		await Course.deleteMany();
		console.log("Data Deleted".red.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
}

const argv = process.argv[2];

if (argv === "-i") {
	// const lastIndex = courses.length - 1;
	// let intervalIndex = 0;
	// let interval = setInterval(() => {
	// 	importData(courses[intervalIndex]);
	// 	if (intervalIndex === lastIndex) {
	// 		clearInterval(interval);
	// 		process.exit()
	// 	}
	// 	intervalIndex++;
	// }, 1000);
	importData()
} else if (argv === "-d") {
	deleteData();
}
