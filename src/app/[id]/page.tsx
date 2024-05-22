"use client";

import { IShortOutput } from "@/server/type";
import { trpc } from "@/utils/trpc";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import Index from "../Index";
import { ShortContext } from "../providers/short.context";

export default function Slug() {
  const { id } = useParams();
  const router = useRouter();
  const { setAlias, setLink } = useContext(ShortContext);

  const { data, isLoading, isFetching, error } =
    trpc.user.getShortById.useQuery(id as string);

  useEffect(() => {
    if (data) {
      setAlias(data?.slug || "");
      setLink(data?.real_url || "");
    }
  }, [data]);

  if (isLoading || isFetching) {
    return "Loading...";
  }

  if (error) {
    router.push("/");
  }

  return <Index data={data as unknown as IShortOutput} />;
}
