import { Request, Response } from "express";
import { Redis } from "ioredis";

export type MyContext = {
  req: Request & { session: any };
  redis: Redis;
  res: Response;
};
// & { session: session.Session & Partial<session.SessionData> }
// & { session: any }
