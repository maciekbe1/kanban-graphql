import express from "express";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express"; //AuthenticationError
import { typeDefs } from "./graphql/schema/";
import { resolvers } from "./graphql/resolvers/";
// import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

require("dotenv").config();

const startServer = async () => {
    const app = express();
    const path = "/graphql";
    const server = new ApolloServer({
        cors: false,
        typeDefs,
        resolvers
    });
    server.applyMiddleware({ app, path, bodyParser });

    await mongoose
        .connect(process.env.MONGO_URI, {
            useNewUrlParser: true
        })
        .then(() => {
            console.log("DB Connected");
        })
        .catch(err => console.error(err));

    app.listen({ port: process.env.PORT || 4000 }, () => {
        console.log(`server runing on`);
    });
};

startServer();
