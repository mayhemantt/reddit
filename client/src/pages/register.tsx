import React from "react";
import { Form, Formik } from "formik";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
        }}>
        {(val, handleChange) => (
          <Form>
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                value={val.username}
                onChange={handleChange}
                id="username"
                placeholder="username"
              />
              {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
