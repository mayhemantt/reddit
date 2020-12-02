import { CSSReset, ThemeProvider } from "@chakra-ui/react";
import theme from "../theme";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Head>
        <title>Next JS +Chakra UI</title>
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
