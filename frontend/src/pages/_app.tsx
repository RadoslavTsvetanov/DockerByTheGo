"use client";
import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import { Theme } from "@radix-ui/themes";
import ClipLoader from "react-spinners/BeatLoader";
import { useEffect, useState } from "react";
import { ErrorComponent } from "~/components/customComponentsNotFromShadcn/error";
import { ctx } from "~/utils/ctx";
type BaseCtx = typeof ctx;

export type ExtendedCtx<T extends object> = BaseCtx & {
  [K in keyof T]: T[K];
};

/* Another way to add additional props if ypu cant add them inside the ctx file (e.g. hooks)  
const additionalProperties = {
  additionalProperty: "Hello World",
  anotherProperty: 42,
  setError: () => void,
};

type AdditionalPropertiesType = typeof additionalProperties;

*/

type AdditionalPropertiesType = {
  setError: (state: string) => void;
  setLoading: (value: boolean) => void;
};

type ctxType = ExtendedCtx<AdditionalPropertiesType>;
export type pageProps = { ctx: ctxType };

const MyApp: AppType<pageProps> = ({ Component, pageProps }) => {
  const [isOnline,setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const full_ctx: ExtendedCtx<AdditionalPropertiesType> = {
    ...ctx,
    setError: (state: string) => {
      setError(state);
    },
    setLoading: (state: boolean) => {
      setIsLoading(state);
    },
  };

  useEffect(() => {
    window.addEventListener("offline", () => {
      setIsOnline(false)
    }) 
    window.addEventListener("online", () => {
      setIsLoading(true);
      setIsOnline(true);
      setIsLoading(false)
    })
  }, []);


  if (error !== null) {
    return <div>
      <h1>Error</h1>
      <p>{ error }</p>
    </div> 
  }

  if (isLoading) {
    return <ClipLoader loading={true} />;
  }

  if (!isOnline) {
    return (
      <div>
        Currently offline, please connect to internet
      </div>
   ) 
  }

  return (
    <main className={GeistSans.className}>
      <Theme>
        <Component {...pageProps} ctx={full_ctx} />
      </Theme>
    </main>
  );
};

export default MyApp;
