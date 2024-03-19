import { ShortContext } from "@/app/providers/short.context";
import { IShortOutput } from "@/server/type";
import { trpc } from "@/utils/trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import { useContext, useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import { z } from "zod";
import { useDebounce } from "use-debounce";
import { Button } from "./ui/button";

interface Props {
  data?: IShortOutput;
}

export default function ShortInput(props: Props) {
  const {
    alias,
    link,
    setLink,
    setAlias,
    linkError,
    setLinkError,
    aliasError,
  } = useContext(ShortContext);
  const [value] = useDebounce(link, 300);
  const { toast } = useToast();
  const createMutation = trpc.createShort.useMutation();
  const updateMutation = trpc.updateShort.useMutation();

  useEffect(() => {
    checkLink();
  }, [value]);

  function checkLink() {
    if (!link) {
      setLinkError("");
      return;
    }

    const { success } = z.string().url().safeParse(link);
    success && setLinkError("");
    !success && setLinkError("Invalid url");
  }

  function onSuccess() {
    toast({
      description: "Success",
      className: "bg-green-700 text-white",
      duration: 1000,
    });

    utils.getShortById.refetch();
    utils.getHistory.refetch();
    if (!props.data) {
      setLink("");
      setAlias("");
    }
  }

  function onError(error: TRPCClientErrorLike<any>) {
    toast({
      description: error.message,
      variant: "destructive",
      duration: 1000,
    });
  }

  const options = { onSuccess, onError };

  const utils = trpc.useUtils();

  function handleShort() {
    if (!link) {
      setLinkError("Invalid url");
      return;
    }

    if (!props.data) {
      createMutation.mutate({ link, alias }, options);
      return;
    }

    updateMutation.mutate({ _id: props.data._id, link, alias }, options);
  }

  return (
    <div className="flex flex-col">
      <div
        className={`flex border rounded-full p-1 flex-grow mx-52 ${
          linkError && "border-red-600"
        }`}
      >
        <input
          type="text"
          placeholder={link || "https://google.com"}
          className="mx-3 outline-none flex-grow"
          value={link}
          onChange={(e) => setLink(e.target.value.trim())}
        />
        <Button
          className="border px-4 py-2 rounded-full bg-purple-300 text-black hover:bg-purple-400 disabled:cursor-not-allowed"
          onClick={handleShort}
          disabled={!!linkError || !!aliasError}
        >
          Short
        </Button>
      </div>
      <div className="text-center text-red-700">{linkError}</div>
    </div>
  );
}
