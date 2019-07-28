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
        tasks: [Task!]!
        status: [String!]!
    }
    type TasksData {
        tasks: [Task!]!
        taskCount: Int!
    }
    type ProjectsData {
        projects: [Project!]!
        totalProjects: Int!
    }
    type Query {
        getAllUserTasks(
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
    }
    input StatusInput {
        name: [String]!
    }
    type Mutation {
        createProject(
            name: String!
            description: String!
            userId: String!
            status: StatusInput
        ): Project!

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
