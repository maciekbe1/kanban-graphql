import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express"; //AuthenticationError
import { typeDefs } from "./graphql/schema/";
import { resolvers } from "./graphql/resolvers/";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import { createServer } from "http";
require("dotenv").config();

const startServer = async () => {
	const app = express();
	// const sessionMiddleware = session({
	// 	secret: process.env.SECRET,
	// 	resave: false,
	// 	saveUninitialized: false
	// });
	app.use(
		// sessionMiddleware,
		cors({ origin: "http://localhost:3000", credentials: true }),
		cookieParser()
	);
	// app.use(async (req, res, next) => {
	// 	console.log(req);
	// 	const token = req.headers["authorization"];
	// 	if (token !== null) {
	// 		try {
	// 			const user = await jwt.verify(token, process.env.SECRET);
	// 			// console.log(user);
	// 		} catch (error) {
	// 			console.log(error);
	// 		}
	// 	}
	// 	next();
	// });
	const path = "/graphql";
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, connection }) => {
			if (connection) {
				// check connection for metadata
				return connection.context;
			} else {
				// check from req
				const token = req.headers.authorization || "";
				return { token };
			}
		},
		subscriptions: {
			onConnect: (connectionParams, webSocket) => {
				const token = connectionParams.authorization;
				const user = jwt.verify(token, process.env.SECRET);
				try {
					console.log(user);
				} catch (error) {
					console.log(error);
				}
			}
		}
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
