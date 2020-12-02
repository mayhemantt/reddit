import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlclient";
import { toErrorMap } from "../../utils/toErrorMap";
// import { toErrorMap } from "../../utils/toErrorMap";
// import login from "../login";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [, changePassword] = useChangePasswordMutation();
  const Router = useRouter();
  const [tokenError, setTokenError] = useState("");
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token,
          });
          if (response.data.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data.changePassword.user) {
            Router.push("/");
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name="newPassword"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            {tokenError ? (
              <Flex>
                <Box>
                  <Box color="red">{tokenError}</Box>
                  <NextLink href="/forgot-password">
                    <Link>go forgot it again</Link>
                  </NextLink>
                </Box>
              </Flex>
            ) : null}
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal">
              change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);
