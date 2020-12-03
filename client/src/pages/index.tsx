import { withUrqlClient } from "next-urql";
import { Link } from "@chakra-ui/react";
// import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlclient";
import NextLink from "next/link";
import { Layout } from "../components/Layout";

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}> {p.title}</div>)
      )}
      Index Page
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
