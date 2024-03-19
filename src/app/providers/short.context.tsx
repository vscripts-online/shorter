import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

interface IShortContext {
  alias: string;
  setAlias: Dispatch<SetStateAction<string>>;
  link: string;
  setLink: Dispatch<SetStateAction<string>>;
  linkError: string;
  setLinkError: Dispatch<SetStateAction<string>>;
  aliasError: string;
  setAliasError: Dispatch<SetStateAction<string>>;
}

export const ShortContext = createContext({} as IShortContext);

interface Props {
  children?: React.ReactNode;
}

export default function ShortProvider(props: Props) {
  const [alias, setAlias] = useState("");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [aliasError, setAliasError] = useState("");

  const value = {
    alias,
    setAlias,
    link,
    setLink,
    linkError,
    setLinkError,
    aliasError,
    setAliasError,
  };
  return (
    <ShortContext.Provider value={value}>
      {props.children}
    </ShortContext.Provider>
  );
}
