import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Args,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
// tslint:disable-next-line: max-classes-per-file
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@Resolver()
export class UserResolver {
  // changePassword
  // changePassword;

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, em, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password should be Greater then 3",
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const redisToken = key.split(" ").join("");

    const userId = await redis.get(redisToken);
    if (!userId) {
      return {
        errors: [
          {
            field: "newPassword",
            message: `Token is expired or invalid`,
          },
        ],
      };
    }
    // tslint:disable-next-line: radix
    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "user no longer exist",
          },
        ],
      };
    }
    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);
    await redis.del(redisToken);
    req.session.userId = user.id;
    return { user };
  }

  // Forgot Password
  // Forgot Password

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ): Promise<boolean> {
    const user = await em.findOne(User, { email });
    if (!user) {
      // email not exist;
      return true;
    }
    const token = v4();
    console.log(token);
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );
    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/
      ${token}
      ">Reset Password</a>`
    );
    return true;
  }

  // me
  // me

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  //register
  //register

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }
    let user: any;

    const hashedPassword = await argon2.hash(options.password);
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          email: options.email,
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
      user.updatedAt = result[0].updated_at;
      user.createdAt = result[0].created_at;
      user.email = result[0].email;
    } catch (err) {
      if (err.code === "23505") {
        // duplicate error
        return {
          errors: [
            {
              field: "username",
              message: "Username  have already been taken",
            },
          ],
        };
      }

      return { errors: err };
    }
    req.session.userId = user.id;
    return { user };
  }

  // login
  //login
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password Not Matched With That Email",
          },
          {
            field: "usernameOrEmail",
            message: "Email Not Matched With That Password or Email Not Found",
          },
        ],
      };
    }
    req.session!.userId = user.id;
    return {
      user,
    };
  }

  //logout
  // logout

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
