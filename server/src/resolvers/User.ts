import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Args,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";
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

@Resolver(User)
export class UserResolver {
  // changePassword
  // changePassword;

  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email;
    }
    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
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
    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

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
    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );
    await redis.del(redisToken);
    req.session.userId = user.id;
    return { user };
  }

  // Forgot Password
  // Forgot Password

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // email not exist;
      return true;
    }
    const token = v4();
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
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  //register
  //register

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }
    let user;

    const hashedPassword = await argon2.hash(options.password);
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: options.email,
          username: options.username,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
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
