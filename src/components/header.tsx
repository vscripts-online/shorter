"use client";

import { useRouter } from "next/navigation";
import Sign from "./sign";

export default function Header() {
  const router = useRouter();

  function onClick() {
    router.push("/");
  }

  return (
    <div className="bg-stone-200">
      <div className="flex justify-between p-5 items-center h-20">
        <div onClick={onClick} className="cursor-pointer">
          Shorter
        </div>
        <Sign />
      </div>
    </div>
  );
}
