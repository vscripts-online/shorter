import { ShortContext } from "@/app/providers/short.context";
import { trpc } from "@/utils/trpc";
import { useContext, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

interface Props {
  alias?: string;
}

export default function CustomAlias(props: Props) {
  const { alias, setAlias, aliasError, setAliasError } =
    useContext(ShortContext);

  const [success, setSuccess] = useState("");
  const [value] = useDebounce(alias, 300);

  const mutation = trpc.public.availableSlug.useMutation();

  useEffect(() => {
    if ((aliasError || success) && alias === "") {
      setSuccess("");
      setAliasError("");
    }

    if (alias && alias !== props.alias) {
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
  }, [value]);

  return (
    <>
      <div className="text-md text-center">Custom alias</div>
      <input
        type="text"
        placeholder={props.alias || "google"}
        className={`outline-none flex-grow p-3 rounded-full mx-72 border 
        ${aliasError && "border-red-400"} ${success && "border-green-400"}`}
        value={alias}
        onChange={(e) => setAlias(e.target.value.trim())}
      />
      <div className="text-md text-center text-green-600">{success}</div>
      <div className="text-md text-center text-red-600">{aliasError}</div>
    </>
  );
}
