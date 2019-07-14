import { Task } from "../../models/Task";
import { User } from "../../models/User";
import { Project } from "../../models/Project";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const resolvers = {
    Query: {
        getTask: (obj, args, context, info) => Task.findById(args._id),
        getAllTasks: async (obj, { projectId, first, skip, search }) => {
            const totalTasks = await Task.find({
                projectId: projectId,
                name: { $regex: search, $options: "i" }
            }).countDocuments();
            const result = {
                tasks: Task.find({ name: { $regex: search, $options: "i" } })
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(first),
                taskCount: totalTasks
            };
            return await result;
        },
        getAllUsers: async () => await User.find(),
        getUser: async (obj, args, context, info) =>
            await User.findById(args._id),
        getTask: async (_, { _id }) => await Task.findById(_id),
        getProject: async (_, { _id }) => awaitProject.findById(_id),
        getAllProjects: async () => await Project.find()
    },
    Mutation: {
        createTask: async (
            _,
            {
                projectId,
                name,
                description,
                performerId,
                creatorId,
                currentSprint,
                currentStatus,
                timeConsuming
            }
        ) => {
            const task = new Task({
                projectId,
                name,
                description,
                performerId,
                creatorId,
                currentSprint,
                currentStatus,
                timeConsuming
            });
            await task.save();
            return task;
        },
        createUser: async (_, { login, password, email, f_name, l_name }) => {
            try {
                const existingUser = await User.findOne({ login });
                if (existingUser) {
                    throw new Error("User already exist");
                }
                const hashedPassword = await bcrypt.hash(password, 12);
                const user = new User({
                    login: login,
                    password: hashedPassword,
                    email: email,
                    f_name: f_name,
                    l_name: l_name
                });
                await user.save();
                return user;
            } catch (err) {
                throw err;
            }
        },
        createProject: async (_, { userId, name, description }) => {
            const project = new Project({
                name: name,
                description: description,
                admins: userId,
                users: userId
            });
            await project.save();
            return project;
        },
        inviteMember: async (_, { projectId, ownerId, guestId }) => {
            const checkUserPermission = await Project.find({
                _id: projectId,
                admins: ownerId
            });
            const checkUserExist = await Project.find({
                _id: projectId,
                users: guestId
            });
            if (!checkUserPermission.length) {
                throw new Error("You do not have access to add user");
            }
            if (checkUserExist.length) {
                throw new Error("User is arleady exist");
            }

            await Project.updateOne({ $push: { users: guestId } });

            const objectId = await mongoose.Types.ObjectId(projectId);
            const project = await Project.findById(objectId);

            return project;
        },
        signIn: async (_, { login, password }) => {
            const user = await User.findOne({ login });
            if (!user) {
                throw new Error("User does not exist!");
            }
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                throw new Error("Password is incorrect!");
            }
            return { token: createToken(user, process.env.SECRET, "1h") };
        }
    }
};
const createToken = (user, secret, expiresIn) => {
    const { login, id } = user;
    return jwt.sign({ login, id }, secret, { expiresIn });
};
