import { gql } from "apollo-server-express";
/*
        getAllStatus(): [Status!]!
getAllSprints(): [Sprint!]!
        getAllActiveSprints(active: Boolean!): [Sprint!]!

*/
export const typeDefs = gql`
	type AuthData {
		token: String!
	}
	type User {
		_id: ID!
		login: String!
		email: String!
		password: String!
		f_name: String!
		l_name: String!
	}
	type Task {
		_id: ID!
		taskIndex: Int!
		projectId: String!
		sprint: String!
		status: String!
		name: String!
		description: String!
		performerID: String!
		creatorID: String!
		currentSprint: String!
		currentStatus: String!
		dateCreated: String!
		dateUpdated: String!
		timeConsuming: String!
	}
	type TasksData {
		tasks: [Task!]!
		taskCount: Int!
	}
	type Comment {
		_id: ID!
		text: String!
		taskID: String!
		dateCreated: String!
		creatorId: String!
	}
	type Sprint {
		_id: ID!
		name: String!
		active: Boolean!
		projectID: String!
	}
	type Status {
		_id: ID!
		name: String!
	}
	type Project {
		_id: ID!
		name: String!
		description: String!
		dateCreated: String!
		active: Boolean!
		admins: [String!]!
		users: [String!]!
	}
	type ProjectsData {
		projects: [Project!]!
		tasks: [Task!]!
		totalProjects: Int!
		totalTasks: Int!
	}
	type Message {
		_id: ID!
		userID: String!
		creator: String!
		message: String!
		date: String!
		readed: Boolean!
		type: String!
	}
	type MessagesData {
		messages: [Message!]!
		totalMessages: Int!
		totalUnreadedMessage: Int!
	}
	type Subscription {
		messageCounter(userID: ID!): Int!
		messageSub(userID: ID!, first: Int): MessagesData!
	}
	type Query {
		getAllPerformerTasks(
			userID: String!
			first: Int
			skip: Int
			search: String
		): TasksData!
		getAllUsers: [User!]!
		getUser(_id: ID!): User!
		getTask(_id: ID!): Task!
		getProject(_id: ID!): Project!
		getAllUserProjects(userID: ID!): ProjectsData!
		getAllUserMessages(
			userID: ID!
			readed: Boolean
			first: Int
			skip: Int
		): MessagesData!
	}
	type Mutation {
		createProject(
			name: String!
			description: String!
			userID: String!
		): Project!
		changeMessageStatus(messageID: ID!): Message!
		inviteMember(
			projectID: String!
			ownerID: String!
			guestID: String!
		): Project!

		createTask(
			projectID: String!
			name: String!
			description: String!
			performerID: String!
			creatorID: String!
			currentSprint: String!
			currentStatus: String!
		): Task!

		createUser(
			login: String!
			email: String!
			password: String!
			f_name: String!
			l_name: String!
		): User!

		signIn(login: String!, password: String!): AuthData!
		createStatus(projectID: String!): [String!]!
		createSprint(name: String!): Sprint!
	}
`;
