import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    taskId: {
        type: String,
        required: true
    },
    creatorId: {
        type: String,
        required: true
    },
    dateCreated: {
        type: String,
        default: Date.now()
    }
});
export const Comment = mongoose.model("Comment", commentSchema);
