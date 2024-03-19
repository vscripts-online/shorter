import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

interface IShortContext {
  setAlias: Dispatch<SetStateAction<string>>;
  alias: string;
  link: string;
  setLink: Dispatch<SetStateAction<string>>;
}

export const ShortContext = createContext({} as IShortContext);

interface Props {
  children?: React.ReactNode;
}

export default function ShortProvider(props: Props) {
  const [alias, setAlias] = useState("");
  const [link, setLink] = useState("");

  const value = {
    alias,
    setAlias,
    link,
    setLink,
  };
  return (
    <ShortContext.Provider value={value}>
      {props.children}
    </ShortContext.Provider>
  );
}
