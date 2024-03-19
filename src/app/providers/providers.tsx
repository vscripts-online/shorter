"use client";

import ShortProvider from "./short.context";

interface Props {
  children?: React.ReactNode;
}

export default function Providers(props: Props) {
  return <ShortProvider>{props.children}</ShortProvider>;
}
