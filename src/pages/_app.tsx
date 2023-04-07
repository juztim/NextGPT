import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "~/styles/bootstrap.min.css";
import "~/styles/custom.scss";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <SessionProvider session={session}>
        <Toaster position="bottom-center" />
        <Component {...pageProps} />
        <Analytics />
      </SessionProvider>
      <Script src="/js/jquery-3.6.3.min.js" strategy="beforeInteractive" />
      <Script src="/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
      <Script src="/js/custom.js" strategy="beforeInteractive" />
    </>
  );
};

export default api.withTRPC(MyApp);
