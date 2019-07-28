import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        minlength: 3,
        maxlength: 30,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    projects: {
        type: Array,
        default: []
    },
    tasks: {
        type: Array,
        default: []
    },
    password: {
        type: String,
        required: true
    },
    f_name: {
        type: String,
        // required: true
        default: ""
    },
    l_name: {
        type: String,
        default: ""
        // required: true
    }
});

export const User = mongoose.model("User", userSchema);

// export function validateUser(user) {
//     const schema = {
//         login: Joi.string().required(),
//         password: Joi.string().required()
//     };
//     return Joi.validate(user, schema);
// }
