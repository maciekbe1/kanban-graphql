import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
	userId: {
		type: String
	},
	creator: {
		type: String,
		default: ""
	},
	readed: {
		type: Boolean,
		default: false
	},
	message: {
		type: String
	},
	date: {
		type: String,
		default: Date.now()
	},
	type: {
		type: String
	}
});
export const Message = mongoose.model("Message", messageSchema);
