import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  //   const [,] = useState<"updoot-loading" | "downdoot-loading" | "not-laoding">();
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <ChevronUpIcon
        onClick={() => {
          vote({
            postId: post.id,
            value: 1,
          });
        }}
        w={8}
        h={8}
      />
      <Text style={{ fontSize: "20px" }}>{post.points}</Text>
      <ChevronDownIcon
        onClick={() => {
          vote({
            postId: post.id,
            value: -1,
          });
        }}
        w={8}
        h={8}
      />
    </Flex>
  );
};
