import { Task } from "../../models/Task";
import { User } from "../../models/User";
import { Project } from "../../models/Project";
import { Message } from "../../models/Message";

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PubSub } from "apollo-server";
const pubsub = new PubSub();

export const resolvers = {
	Subscription: {
		messageCounter: {
			subscribe: async (_, { userID }) => {
				getUnreadedMessagesCount(userID);
				return await pubsub.asyncIterator("messageCounter");
			}
		},
		messageSub: {
			subscribe: async (_, { userID, first }) => {
				getMessagesSubs(userID, first);
				return await pubsub.asyncIterator("messageSub");
			}
		}
	},
	Query: {
		getAllPerformerTasks: async (obj, { userID, search }) => {
			// const taskArray = await User.findById(userID).distinct("tasks");
			const tasks = await Task.find({
				performerID: userID
			});
			if (!tasks.length) {
				throw new Error("No tasks exist");
			}
			if (search) {
				const filtered = Task.find({
					performerID: userID,
					name: { $regex: search, $options: "i" }
				});

				return await {
					tasks: filtered,
					taskCount: tasks.length
				};
			}

			return await {
				tasks: tasks,
				taskCount: tasks.length
			};
		},
		getAllUsers: async () => await User.find(),
		getUser: async (_, { _id }) => await User.findById(_id),
		getTask: async (_, { _id }) => await Task.findById(_id),
		getProject: async (_, { _id }) => await Project.findById(_id),
		getAllUserProjects: async (_, { userID }) => {
			const projectExist = await Project.find({
				users: userID
			}).countDocuments();
			const projects = await Project.find({ users: userID });
			const tasks = await Task.find({
				projectID: projects.map(project => {
					return project._id;
				})
			});
			if (!projectExist) {
				throw new Error("No project exist");
			}
			return {
				totalProjects: projects.length,
				totalTasks: tasks.length,
				projects: projects,
				tasks: tasks
			};
		},
		getAllUserMessages: async (_, { userID, readed, first, skip }) => {
			const totalMessages = await Message.find({
				userID: userID
			}).countDocuments();
			if (!totalMessages) {
				throw new Error("no messages");
			}
			const messages = await Message.find({
				userID: userID
			})
				.sort({ date: -1 })
				.skip(skip)
				.limit(first);
			const totalUnreadedMessage = await Message.find({
				userID: userID,
				readed: false
			}).countDocuments();
			const unreadedMessages = await Message.find({
				userID: userID,
				readed: false
			})
				.sort({ date: -1 })
				.skip(skip)
				.limit(first);
			// console.log(first);
			if (readed) {
				return await {
					messages: unreadedMessages,
					totalMessages: totalMessages,
					totalUnreadedMessage: totalUnreadedMessage
				};
			}
			return await {
				messages: messages,
				totalMessages: totalMessages,
				totalUnreadedMessage: totalUnreadedMessage
			};
		}
	},
	Mutation: {
		changeMessageStatus: async (_, { messageID }) => {
			const message = await Message.findById(messageID);
			await message.updateOne({ readed: true });
			// const messageOwner = Message.find({
			// 	userID: message.userID
			// })
			// getMessagesSubs(message.userID);
			getUnreadedMessagesCount(message.userID);
			return message;
		},
		createTask: async (
			_,
			{
				projectID,
				name,
				description,
				performerID,
				creatorID,
				currentSprint,
				currentStatus
			}
		) => {
			const tasks = await Task.find({
				projectID: projectID
			});
			const taskIndex = tasks.length;
			const task = new Task({
				projectID,
				taskIndex,
				name,
				description,
				performerID,
				creatorID,
				currentSprint,
				currentStatus
			});
			const checkUserInProject = await User.find({
				_id: performerID,
				users: performerID
			});
			// console.log(checkUserInProject);

			if (checkUserInProject.length) {
				throw new Error("User does not exist in this project!");
			}
			// const user = await User.findById(performerID);
			// const project = await Project.findById(projectID);
			await task.save();
			// await project.updateOne({})({ $push: { tasks: task._id } });
			// await user.updateOne({ $push: { tasks: task._id } });

			//dodac oddelegowanie do taska
			const message = new Message({
				userID: performerID,
				creator: creatorID,
				type: "Task",
				message: `You have new an issue. Date ${task.dateCreated}`
			});
			await message.save();
			getUnreadedMessagesCount(performerID);
			getMessagesSubs(performerID);
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
				const message = new Message({
					userID: user._id,
					type: "User",
					message: `Welcome!`
				});
				await message.save();
				return user;
			} catch (err) {
				throw err;
			}
		},
		createProject: async (_, { userID, name, description }) => {
			const project = new Project({
				name: name,
				description: description,
				admins: userID,
				users: userID
			});
			// const user = User.findById(userID);
			await project.save();
			// await user.updateOne({ $push: { projects: project._id } });
			const message = new Message({
				userID: userID,
				type: "Project",
				message: `Project ${name} was successfuly created`
			});
			await message.save();
			return project;
		},
		inviteMember: async (_, { projectID, ownerID, guestID }) => {
			const checkUserPermission = await Project.find({
				_id: projectID,
				admins: ownerID
			});
			const checkUserExist = await Project.find({
				_id: projectID,
				users: guestID
			});
			if (!checkUserPermission.length) {
				throw new Error("You do not have access to add user");
			}
			//remove length
			if (checkUserExist.length) {
				throw new Error("User is arleady exist in this project");
			}

			await Project.find({ _id: projectID }).updateOne({
				$push: { users: guestID }
			});

			const objectId = await mongoose.Types.ObjectId(projectID);
			const project = await Project.findById(objectId);
			// const user = await User.findById(guestID);
			// console.log(user.projects);
			// await user.updateOne({ $push: { projects: project._id } });
			// console.log(update);
			const message = new Message({
				userID: userID,
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
			const token = createToken(user, process.env.SECRET);
			return { token: token };
		}
	}
};
const createToken = (user, secret) => {
	const { login, id } = user;
	return jwt.sign({ login, id }, secret);
};
const getMessagesSubs = async (userID, first) => {
	const messages = await Message.find({
		userID: userID
	})
		.sort({ date: -1 })
		.limit(first);
	const totalMessages = await Message.find({
		userID: userID
	}).countDocuments();
	const totalUnreadedMessage = await Message.find({
		userID: userID,
		readed: false
	}).countDocuments();
	const messageSub = {
		messages: messages,
		totalMessages: totalMessages,
		totalUnreadedMessage: totalUnreadedMessage
	};
	pubsub.publish("messageSub", {
		messageSub
	});
	return messageSub;
};
const getUnreadedMessagesCount = async userID => {
	const unreadedMessages = await Message.find({
		userID: userID,
		readed: false
	}).countDocuments();
	pubsub.publish("messageCounter", {
		messageCounter: unreadedMessages
	});
	return unreadedMessages;
};
