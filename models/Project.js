import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    description: {
        type: String
    },
    dateCreated: {
        type: String,
        default: Date.now()
    },
    admins: {
        type: Array,
        default: []
    },
    users: {
        type: Array,
        default: []
    },
    tasks: {
        type: Array,
        default: []
    }
});
export const Project = mongoose.model("Project", projectSchema);
