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
        type: Boolean
    },
    message: {
        type: String
    },
    date: {
        type: String,
        default: Date.now()
    }
});
export const Message = mongoose.model("Message", messageSchema);
