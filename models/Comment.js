import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true
	},
	taskID: {
		type: String,
		required: true
	},
	creatorID: {
		type: String,
		required: true
	},
	dateCreated: {
		type: String,
		default: Date.now()
	}
});
export const Comment = mongoose.model("Comment", commentSchema);
