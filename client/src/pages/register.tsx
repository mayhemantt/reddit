import React from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

interface registerProps {}

const REGISTER_MUTATION = `
  mutation Register($username:String!, $password:String!){
  register(options:{username:$username, password:$password}){
    user{
      id
      updatedAt
      username
      createdAt
    }
    errors{
      message
    	field
    }
  }
}
`;

const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          if (response.data.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data.register.user) {
            router.push("/");
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
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
            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              colorScheme="teal">
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
