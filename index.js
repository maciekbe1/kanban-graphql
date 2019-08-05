import express from "express";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express"; //AuthenticationError
import { typeDefs } from "./graphql/schema/";
import { resolvers } from "./graphql/resolvers/";
// import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import { createServer } from "http";
require("dotenv").config();

const startServer = async () => {
	const app = express();
	const path = "/graphql";
	const server = new ApolloServer({
		typeDefs,
		resolvers
	});
	server.applyMiddleware({ app, path, bodyParser });
	const httpServer = createServer(app);
	server.installSubscriptionHandlers(httpServer);
	await mongoose
		.connect(process.env.MONGO_URI, {
			useNewUrlParser: true
		})
		.then(() => {
			console.log("DB Connected");
		})
		.catch(err => console.error(err));

	httpServer.listen({ port: process.env.PORT || 4000 }, () => {
		console.log(
			`server ready at http://localhost:${process.env.PORT}${
				server.graphqlPath
			}`
		);
		console.log(
			`Subscriptions ready at ws://localhost:${process.env.PORT}${
				server.subscriptionsPath
			}`
		);
	});
};

startServer();
