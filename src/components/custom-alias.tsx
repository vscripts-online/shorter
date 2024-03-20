import { ShortContext } from "@/app/providers/short.context";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

interface Props {
  alias?: string;
}

export default function CustomAlias(props: Props) {
  const { alias, setAlias, aliasError, setAliasError } =
    useContext(ShortContext);

  const [success, setSuccess] = useState("");
  const [value] = useDebounce(alias, 250);

  const mutation = trpc.public.availableSlug.useMutation();

  function checkSlug() {
    mutation.mutate(alias, {
      onSuccess() {
        setAliasError("");
        setSuccess("Available");
      },
      onError(error) {
        setAliasError(error.message);
        setSuccess("");
      },
    });
  }

  useEffect(() => {
    if (alias && alias !== props.alias) {
      const timeout = setTimeout(checkSlug, 400);
      return () => clearTimeout(timeout);
    } else {
      setSuccess("");
      setAliasError("");
    }
  }, [value]);

  return (
    <>
      <div className="text-md text-center">Custom alias</div>
      <div className="flex items-center justify-center gap-25">
        <input
          type="text"
          placeholder={props.alias || "google"}
          className={`outline-none p-3 rounded-full  border 
        ${aliasError && "border-red-400"} ${success && "border-green-400"}`}
          value={alias}
          onChange={(e) => setAlias(e.target.value.trim())}
        />
        {mutation.isPending && <Loader2 className="animate-spin ml-3" />}
      </div>
      <div className="text-md text-center text-green-600">{success}</div>
      <div className="text-md text-center text-red-600">{aliasError}</div>
    </>
  );
}
