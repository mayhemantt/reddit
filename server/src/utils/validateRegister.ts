import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@") && options.email.length <= 3) {
    return [
      {
        field: "email",
        message: "Invalid Email",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "username cannot include @ sign",
      },
    ];
  }

  if (options.username.length <= 3) {
    return [
      {
        field: "username",
        message: "username length must be greater then 3",
      },
    ];
  }
  if (options.password.length <= 3) {
    return [
      {
        field: "password",
        message: "password length must be greater then 3",
      },
    ];
  }

  return null;
};
