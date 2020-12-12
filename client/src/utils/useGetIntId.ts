import { useRouter } from "next/router";

export const useGetId = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : null;

  return intId;
};
