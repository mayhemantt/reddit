import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod_ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/Post";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  orm.getMigrator().up();

  // const post = orm.em.create(Post, { title: "my first post" });
  // await orm.em.persistAndFlush(post);

  // const post = await orm.em.find(Post, {});
  // console.log(post);

  const app = express();
  // app.get("/", (req, res) => {
  //   res.json("Hello");
  // });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(8000, () => {
    console.log(`$on http://localhost:8000/graphql`);
  });
};

main().catch((err) => {
  console.error(err);
});

console.log("Hello World");
