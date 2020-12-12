import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";

interface SessionType {
  userId: number;
}

export type MyContext = {
  req: Request & { session: SessionType };
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
// & { session: session.Session & Partial<session.SessionData> }
// & { session: any }
