import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50
	},
	taskIndex: {
		type: Number
	},
	user: {
		type: String
	},
	project: {
		type: String
	},
	description: {
		type: String,
		required: true
	},
	projectID: {
		type: String,
		required: true
	},
	status: {
		type: String,
		default: "None"
	},
	performerID: {
		type: String,
		required: true
	},
	creatorID: {
		type: String,
		required: true
	},
	currentSprint: {
		type: String,
		required: true
	},
	currentStatus: {
		type: String,
		required: true
	},
	dateCreated: {
		type: String,
		default: Date.now()
	},
	dateUpdated: {
		type: String,
		default: Date.now()
	},
	timeConsuming: {
		type: String,
		default: ""
	}
});
export const Task = mongoose.model("Task", taskSchema);
