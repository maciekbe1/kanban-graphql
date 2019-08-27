import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	active: {
		type: Boolean,
		default: true
	},
	projectID: {
		type: String,
		required: true
	}
});
export const Sprint = mongoose.model("Sprint", sprintSchema);
