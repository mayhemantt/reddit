import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod_ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";
import cors from "cors";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  orm.getMigrator().up();

  // const post = orm.em.create(Post, { title: "my first post" });
  // await orm.em.persistAndFlush(post);

  // const post = await orm.em.find(Post, {});
  // console.log(post);

  const app = express();
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  // app.get("/", (req, res) => {
  //   res.json("Hello");
  // });

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // mili secs* sec * min * hours * year * 10
        httpOnly: true,
        secure: __prod_, // cookie work in https only
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "bills",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
      skipCheck: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(8000, () => {
    console.log(`$on http://localhost:8000/graphql`);
  });
};

main().catch((err) => {
  console.error(err);
});

console.log("Hello World");
