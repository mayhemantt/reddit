"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("./constants");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const Post_1 = require("./resolvers/Post");
const User_1 = require("./resolvers/User");
const cors_1 = __importDefault(require("cors"));
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const typeorm_1 = require("typeorm");
const User_2 = require("./entities/User");
const Post_2 = require("./entities/Post");
const path_1 = __importDefault(require("path"));
const Updoot_1 = require("./entities/Updoot");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = typeorm_1.createConnection({
        type: "postgres",
        database: "reddit2",
        username: "hemant",
        password: "ubuntu",
        logging: true,
        synchronize: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [User_2.User, Post_2.Post, Updoot_1.Updoot],
        cache: true,
    });
    (yield connection).runMigrations();
    const app = express_1.default();
    app.use(cors_1.default({ origin: "http://localhost:3000", credentials: true }));
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redis = new ioredis_1.default();
    app.use(express_session_1.default({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            secure: constants_1.__prod_,
            sameSite: "lax",
        },
        saveUninitialized: false,
        secret: "bills",
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [hello_1.HelloResolver, Post_1.PostResolver, User_1.UserResolver],
            validate: false,
            skipCheck: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(8000, () => {
        console.log(`Up At http://localhost:8000/graphql`);
    });
});
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map