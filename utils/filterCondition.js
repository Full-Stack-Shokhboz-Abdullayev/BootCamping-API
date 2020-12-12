const Bootcamp = require("../models/Bootcamp");


module.exports = async (params) => {
    const { bootcampId, bootcampSlug } = params;
	let filters;
	if (bootcampSlug) {
		const bootcamp = await Bootcamp.findOne({
			slug: bootcampSlug
		})
		filters = {
			bootcamp: bootcamp._id,
		};
	} else if (bootcampId) {
		filters = {
			bootcamp: bootcampId,
		};
	} else {
		filters = {};
    }
    return filters
}