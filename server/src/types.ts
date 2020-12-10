import { Request, Response } from "express";
import { Redis } from "ioredis";

interface SessionType {
  userId: number;
}

export type MyContext = {
  req: Request & { session: SessionType };
  redis: Redis;
  res: Response;
};
// & { session: session.Session & Partial<session.SessionData> }
// & { session: any }
