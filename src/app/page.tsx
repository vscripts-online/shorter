"use client";

import { useContext, useEffect } from "react";
import Index from "./Index";
import { ShortContext } from "./providers/short.context";

export default function Home() {
  const { setAlias, setLink } = useContext(ShortContext);

  useEffect(() => {
    setAlias("");
    setLink("");
  }, []);

  return <Index />;
}
