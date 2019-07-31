import { Task } from "../../models/Task";
import { User } from "../../models/User";
import { Project } from "../../models/Project";
import { Message } from "../../models/Message";

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PubSub } from "apollo-server";
const pubsub = new PubSub();

const USER_MESSAGES = "USER_MESSAGES";
export const resolvers = {
	Subscription: {
		messages: {
			subscribe: async () => {
				return await pubsub.asyncIterator([USER_MESSAGES]);
			}
		}
	},
	Query: {
		getAllPerformerTasks: async (obj, { userId, search }) => {
			// const taskArray = await User.findById(userId).distinct("tasks");
			const tasks = await Task.find({
				performerId: userId
			});
			if (!tasks.length) {
				throw new Error("No tasks exist");
			}
			if (search) {
				const filtered = Task.find({
					performerId: userId,
					name: { $regex: search, $options: "i" }
				});

				return await {
					tasks: filtered,
					taskCount: tasks.length
				};
			}
			// const tasks = taskArray.map(task => {
			//     return Task.findById(task);
			// });

			return await {
				tasks: tasks,
				taskCount: tasks.length
			};
		},
		getAllUsers: async () => await User.find(),
		getUser: async (_, { _id }) => await User.findById(_id),
		getTask: async (_, { _id }) => await Task.findById(_id),
		getProject: async (_, { _id }) => await Project.findById(_id),
		getAllUserProjects: async (_, { userId }) => {
			// const projectsArray = await User.findById(userId).distinct(
			//     "projects"
			// );

			// if (!projectsArray.length) {
			//     throw new Error("No project exist");
			// }
			// const projects = projectsArray.map(project => {
			//     return Project.findById(project);
			// });

			const projects = await Project.find({ users: userId });
			const tasks = await Task.find({
				projectId: projects.map(project => {
					return project._id;
				})
			});
			// const tasks = projects.map(project => {
			//     return Task.find({ projectId: project._id });
			// });
			// const filter = projects.map(project => {
			//     const result = project.users.map(user => {
			//         return user === userId;
			//     });
			//     return result ? project : null;
			// });
			if (!projects.length) {
				throw new Error("No project exist");
			}

			return {
				totalProjects: projects.length,
				totalTasks: tasks.length,
				projects: projects,
				tasks: tasks
			};
		},
		getAllUserMessages: async (_, { userId, readed, first, skip }) => {
			const totalMessages = await await Message.find({
				userId: userId
			}).countDocuments();
			const messages = await Message.find({
				userId: userId
			})
				.sort({ date: -1 })
				.skip(skip)
				.limit(first);
			const totalUnreadedMessage = await Message.find({
				userId: userId,
				readed: false
			}).countDocuments();
			const unreadedMessages = await Message.find({
				userId: userId,
				readed: false
			})
				.sort({ date: -1 })
				.skip(skip)
				.limit(first);

			if (readed) {
				return await {
					messages: unreadedMessages,
					totalMessages: totalMessages,
					unreadedMessages: totalUnreadedMessage
				};
			}
			return await {
				messages: messages,
				totalMessages: totalMessages,
				unreadedMessages: totalUnreadedMessage
			};
		}
	},
	Mutation: {
		changeMessageStatus: async (_, { messageId }) => {
			const message = await Message.findById(messageId);
			await message.updateOne({ readed: true });
			return message;
		},
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
			const tasks = await Task.find({
				projectId: projectId
			});
			const taskIndex = tasks.length;
			const task = new Task({
				projectId,
				taskIndex,
				name,
				description,
				performerId,
				creatorId,
				currentSprint,
				currentStatus,
				timeConsuming
			});
			const checkUserInProject = await User.find({
				_id: performerId,
				users: performerId
			});
			// console.log(checkUserInProject);

			if (checkUserInProject.length) {
				throw new Error("User does not exist in this project!");
			}
			// const user = await User.findById(performerId);
			// const project = await Project.findById(projectId);
			await task.save();
			// await project.updateOne({})({ $push: { tasks: task._id } });
			// await user.updateOne({ $push: { tasks: task._id } });

			//dodac oddelegowanie do taska
			const message = new Message({
				userId: performerId,
				creator: creatorId,
				type: "Task",
				message: `You have new an issue.`
			});
			await message.save();
			return task;
		},
		createUser: async (_, { login, password, email, f_name, l_name }) => {
			try {
				const existingUser = await User.findOne({ login });
				if (existingUser) {
					throw new Error("User already exist!");
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
		createProject: async (_, { userId, name, description, status }) => {
			const project = new Project({
				name: name,
				description: description,
				admins: userId,
				users: userId,
				status: status.name
			});
			// const user = User.findById(userId);
			await project.save();
			// await user.updateOne({ $push: { projects: project._id } });
			const message = new Message({
				userId: userId,
				type: "Project",
				message: `Project ${name} was successfuly created`
			});
			await message.save();
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
			//remove length
			if (checkUserExist.length) {
				throw new Error("User is arleady exist in this project");
			}

			await Project.find({ _id: projectId }).updateOne({
				$push: { users: guestId }
			});

			const objectId = await mongoose.Types.ObjectId(projectId);
			const project = await Project.findById(objectId);
			// const user = await User.findById(guestId);
			// console.log(user.projects);
			// await user.updateOne({ $push: { projects: project._id } });
			// console.log(update);
			const message = new Message({
				userId: userId,
				type: "Invite",
				message: `You have been invited to project`
			});
			await message.save();
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
