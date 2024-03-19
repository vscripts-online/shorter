"use client";

import { Dispatch, SetStateAction, createContext, useState } from "react";
import Login from "./login";
import Register from "./register";
import RegisterPassword from "./register_password";

type SignEnum = "login" | "register" | "register_password";

interface ISignContext {
  setEmail: Dispatch<SetStateAction<string>>;
  setSign: Dispatch<SetStateAction<SignEnum>>;
  email: string;
}

export const SignContext = createContext({} as ISignContext);

export default function Sign() {
  const [sign, setSign] = useState<SignEnum>("login");
  const [email, setEmail] = useState<string>("");

  const value = {
    sign,
    setSign,
    setEmail,
    email,
  };

  return (
    <SignContext.Provider value={value}>
      <div className="w-screen mt-20">
        <div className="flex flex-col items-center">
          <div className="text-2xl mb-5">Sign</div>
          <div className="border p-5 rounded-xl bg-gray-50 w-[calc(100vw/2)]">
            {sign === "login" && <Login />}
            {sign === "register" && <Register />}
            {sign === "register_password" && <RegisterPassword />}
          </div>
        </div>
      </div>
    </SignContext.Provider>
  );
}
