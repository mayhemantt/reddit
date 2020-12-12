import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";
import { useGetId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
  const intId = useGetId();
  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
