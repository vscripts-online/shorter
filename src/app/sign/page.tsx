"use client";

import { createContext, useState } from "react";
import Login from "./login";
import Register from "./register";
import RegisterPassword from "./register_password";

interface ISignContext {
  setLogin: () => void;
  setRegister: () => void;
  setRegisterPassword: () => void;
  updateEmail: (value: string) => void;
  email: string;
}

type SignEnum = "login" | "register" | "register_password";

export const SignContext = createContext({} as ISignContext);

export default function Sign() {
  const [sign, setSign] = useState<SignEnum>("login");
  const [email, setEmail] = useState<string>("");

  function setLogin() {
    setSign("login");
  }

  function setRegister() {
    setSign("register");
  }

  function setRegisterPassword() {
    setSign("register_password");
  }

  function updateEmail(value: string) {
    setEmail(value);
  }

  const value = {
    sign,
    setLogin,
    setRegister,
    setRegisterPassword,
    updateEmail,
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
