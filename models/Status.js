import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	projectID: {
		type: String,
		required: true
	}
});
export const Status = mongoose.model("Status", statusSchema);
