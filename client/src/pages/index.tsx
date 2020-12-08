import { withUrqlClient } from "next-urql";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
// import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlclient";
import NextLink from "next/link";
import { Layout } from "../components/Layout";
import { useState } from "react";
import { UpdootSection } from "../components/UpdootSection";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>You got no Post for some reason</div>;
  }
  return (
    <Layout>
      <Flex mb={7} align={"center"}>
        <Heading as={"h1"}>Reddit</Heading>
        <NextLink href="/create-post">
          <Link ml={"auto"}>Create Post</Link>
        </NextLink>
      </Flex>
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) => (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p} />
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text> Posted By {p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet} ...</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
            m={"auto"}
            my={8}>
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
