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
		projects: [String!]!
		tasks: [String!]!
	}
	type Task {
		_id: ID!
		taskIndex: Int!
		projectId: String!
		sprint: String!
		status: String!
		name: String!
		description: String!
		performerId: String!
		creatorId: String!
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
		taskId: String!
		dateCreated: String!
		creatorId: String!
	}
	type Sprint {
		_id: ID!
		name: String!
		active: Boolean!
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
		admins: [String!]!
		users: [String!]!
		status: [String!]!
	}
	type ProjectsData {
		projects: [Project!]!
		tasks: [Task!]!
		totalProjects: Int!
		totalTasks: Int!
	}
	type Message {
		_id: ID!
		userId: String!
		creator: String!
		message: String!
		date: String!
		readed: Boolean!
		type: String!
	}
	type MessagesData {
		messages: [Message!]!
		totalMessages: Int!
		unreadedMessages: Int!
	}
	type Subscription {
		messages(userId: String): Project
	}
	input StatusInput {
		name: [String]!
	}
	type Query {
		getAllPerformerTasks(
			userId: String!
			first: Int
			skip: Int
			search: String
		): TasksData!
		getAllUsers: [User!]!
		getUser(_id: ID!): User!
		getTask(_id: ID!): Task!
		getProject(_id: ID!): Project!
		getAllUserProjects(userId: ID!): ProjectsData!
		getAllUserMessages(
			userId: ID!
			readed: Boolean
			first: Int
			skip: Int
		): MessagesData!
	}
	type Mutation {
		createProject(
			name: String!
			description: String!
			userId: String!
			status: StatusInput
		): Project!
		changeMessageStatus(messageId: ID!): Message!
		inviteMember(
			projectId: String!
			ownerId: String!
			guestId: String!
		): Project!

		createTask(
			projectId: String!
			name: String!
			description: String!
			performerId: String!
			creatorId: String!
			currentSprint: String!
			currentStatus: String!
			timeConsuming: String!
		): Task!

		createUser(
			login: String!
			email: String!
			password: String!
			f_name: String!
			l_name: String!
		): User!

		signIn(login: String!, password: String!): AuthData!
		createStatus(projectId: String!): [String!]!
		createSprint(name: String!): Sprint!
	}
`;
