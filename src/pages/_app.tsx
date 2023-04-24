import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
export { reportWebVitals } from "next-axiom";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "~/styles/bootstrap.min.css";
import "~/styles/custom.scss";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { log } from "next-axiom";
import { IntlProvider } from "react-intl";
import { useRouter } from "next/router";
import de from "~/lang/de.json";
import en from "~/lang/en.json";

if (process.env.NODE_ENV === "production") {
  console.error = (message: string, ...args) => {
    log.error(message, args);
  };
  console.warn = (message: string, ...args) => {
    log.warn(message, args);
  };
  console.info = (message: string, ...args) => {
    log.info(message, args);
  };
}

const messages = {
  en,
  de,
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { locale: browserLocale } = useRouter();

  return (
    <>
      <Head>
        <title>FutureDesk</title>
        <meta name="description" content="FutureDesk" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      {/* eslint-disable @typescript-eslint/no-unsafe-assignment */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <IntlProvider locale={browserLocale} messages={messages[browserLocale]}>
        <SessionProvider session={session}>
          <Toaster position="top-center" />
          <Component {...pageProps} />
          <Analytics />
        </SessionProvider>
      </IntlProvider>
      <Script src="/js/jquery-3.6.3.min.js" strategy="beforeInteractive" />
      <Script src="/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
      <Script src="/js/custom.js" strategy="beforeInteractive" />
    </>
  );
};

export default api.withTRPC(MyApp);
