import "reflect-metadata";
import { __prod_, COOKIE_NAME } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";
import cors from "cors";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
// import { sendEmail } from "./utils/sendEmail";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const main = async () => {
  const connection = createConnection({
    type: "postgres",
    database: "reddit2",
    username: "hemant",
    password: "ubuntu",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post, Updoot],
    cache: true,
  });

  (await connection).runMigrations();

  // await Post.delete({});
  // console.log("wiped out Post");

  // connection;

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // mili secs* sec * min * hours * year * 10
        // httpOnly: true,
        // secure: __prod_, // cookie work in https only
        sameSite: "lax",
      },
      // saveUninitialized: false,
      secret: "bills",
      // resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
      skipCheck: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(8000, () => {
    // tslint:disable-next-line: no-console
    console.log(`Up At http://localhost:8000/graphql`);
  });
};

main().catch((err) => {
  // tslint:disable-next-line: no-console
  console.log(err);
});
