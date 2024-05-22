"use client";

import Image from "next/image";
import { HTMLAttributes } from "react";

interface Props {
  avatar?: string;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  imgClassName?: HTMLAttributes<HTMLImageElement>["className"];
  size?: number;
}

export default function UserAvatar(props: Props) {
  const avatar =
    props.avatar || process.env.NEXT_PUBLIC_AUTH_HOST + "/user.png";
  const size = props.size || 50;
  const classname = props.className || "";
  const imgClassname = props.imgClassName || "";

  return (
    <div className={`size-[${size}px] ${classname}`}>
      <Image
        src={avatar}
        alt="avatar"
        className={`rounded-full !relative border-2 border-sky-950 ${imgClassname}`}
        fill
        sizes={`${size}px`}
      />
    </div>
  );
}
