import React from "react";
import { Form, Formik } from "formik";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlclient";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
// interface registerProps {}

const Login: React.FC<{}> = ({}) => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data.login.user) {
            router.push("/");
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="Username or Email"
              label="Username or Email"
              type="username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forgot-password">
                <Link ml="auto">forgot Password?</Link>
              </NextLink>
            </Flex>
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal">
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
