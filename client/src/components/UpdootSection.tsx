import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
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
      <IconButton
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          await vote({
            postId: post.id,
            value: 1,
          });
        }}
        aria-label="updoot post"
        icon={<ChevronUpIcon />}
      />
      <Text style={{ fontSize: "20px" }}>{post.points}</Text>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          await vote({
            postId: post.id,
            value: -1,
          });
        }}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        aria-label="downdoot post"
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};
