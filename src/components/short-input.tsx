import { IShortOutput } from "@/app/api/trpc/type";
import { ShortContext } from "@/app/providers/short.context";
import { useContext } from "react";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/utils/trpc";
import { TRPCClientErrorLike } from "@trpc/client";

interface Props {
  data?: IShortOutput;
}

export default function ShortInput(props: Props) {
  const { alias, link, setLink, setAlias } = useContext(ShortContext);
  const { toast } = useToast();
  const createMutation = trpc.createShort.useMutation();
  const updateMutation = trpc.updateShort.useMutation();

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
    if (!props.data) {
      createMutation.mutate({ link, alias }, options);
      return;
    }

    updateMutation.mutate({ _id: props.data._id, link, alias }, options);
  }

  return (
    <>
      <input
        type="text"
        placeholder={link || "https://google.com"}
        className="mx-3 outline-none flex-grow"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <button
        className="border px-4 py-2 rounded-full bg-purple-200"
        onClick={handleShort}
      >
        Short
      </button>
    </>
  );
}
