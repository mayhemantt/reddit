import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";

interface NavBarProps {
  p: string;
}

export const NavBar: React.FC<NavBarProps> = ({ p = "not set" }) => {
  const router = useRouter();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  const apollo = useApolloClient();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  let body = null;

  if (loading) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr="2">login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            <Link mr={2}>Create Post</Link>
          </Button>
        </NextLink>
        <Box mr="2">{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            await apollo.resetStore();
          }}
          isLoading={logoutFetching}
          variant="link">
          {" "}
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex position="sticky" align="center" p="4" ml="auto" bg={"tan"}>
      <NextLink href="/">
        <Link>
          {" "}
          <Heading>Reddit</Heading>
        </Link>
      </NextLink>
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};
