import { MikroORM } from "@mikro-orm/core";
import { __prod_ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  user: "hemant",
  password: "ubuntu",
  dbName: "lreddit",
  debug: !__prod_,
  type: "postgresql",
} as Parameters<typeof MikroORM.init>[0]; // as const works fine but the Intellisense wont suggest
// or as Parameters<typeof MikroORM.init>[0]
