import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: any };
  redis: Redis;
  res: Response;
};
// & { session: session.Session & Partial<session.SessionData> }
// & { session: any }
