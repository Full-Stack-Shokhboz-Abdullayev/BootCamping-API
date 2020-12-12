const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
// Load ENV Vars
dotenv.config({ path: "./config/config.env" });

// Connect to DB
connectDB();

// Route Files
const bootcampsRouter = require("./routes/bootcamps");
const coursesRouter = require("./routes/courses");

// App instance
const app = express();

//Body parser
app.use(express.json());

// Morgan logger package if development
if (process.env.NODE_ENV === "development") {
	const morgan = require("morgan");
	app.use(morgan("dev"));
}

// Mount Routes
app.use("/api/v1/bootcamps", bootcampsRouter);
app.use("/api/v1/courses", coursesRouter);

//Handle Errors
// Note always put middlewares after the routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue
			.bold
	)
);

//Handle Promise Rejections

process.on("unhandledRejection", (err, promise) => {
	console.log(`Unhandled Rejection: ${err.message}`.red);
	//Close Server
	server.close(() => process.exit(1));
});
