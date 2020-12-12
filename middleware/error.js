const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    
    error.message = err.message;
	// Log to console for the Developer
	console.log(err);

    // Mongoose bad ObjectId
	if (err.name === "CastError") {
		const message = `Resource not found with an id of ${err.value}`;
        error = new ErrorResponse(message, 404) 
    } 

	if (err.name === 'ValidationError') {
        const fields = Object.keys(err.errors)
		const message = `Validation Error. Please add required fields: ${fields.join(', ')}.`;
        error = new ErrorResponse(message, 400) 
    } 
	if (err.code === 11000) {
		const message = `Duplicate field value entered: ${err.keyValue.name}`;
        error = new ErrorResponse(message, 400) 
    } 

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error!"
    })
};

module.exports = errorHandler;
