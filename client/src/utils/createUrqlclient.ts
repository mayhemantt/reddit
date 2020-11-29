import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:8000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, {}, cache, {}) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              _result,
              { query: MeDocument },
              () => ({ me: null })
            );
          },
          login: (_result, {}, cache, {}) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              _result,
              { query: MeDocument },
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (_result, _, cache) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              _result,
              { query: MeDocument },
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return { me: result.register.user };
                }
              }
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
