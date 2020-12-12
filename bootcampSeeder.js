const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Load models
const Bootcamp = require("./models/Bootcamp");

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

// Read Json files
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

// Import into DB
const importData = async (bootcamp) => {
	try {
		await Bootcamp.create(bootcamp);
	} catch (err) {
		console.log(err);
	}
};

//Delete data from DB
const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
		console.log("Data destroyed...".red.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

//Passed Argument
const pArg = process.argv[2];
if (pArg === "-i") {
    const lastIndex = bootcamps.length - 1;
    let intervalIndex = 0
	let interval = setInterval(() => {
        importData(bootcamps[intervalIndex])
        if(intervalIndex === lastIndex) {
			clearInterval(interval)
			process.exit();
        }
        intervalIndex++
    }, 1000)
	console.log("Data imported...".green.inverse);
} else if (pArg === "-d") {
	deleteData();
}
