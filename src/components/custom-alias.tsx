import { ShortContext } from "@/app/providers/short.context";
import { trpc } from "@/utils/trpc";
import { useContext, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

interface Props {
  alias?: string;
}

export default function CustomAlias(props: Props) {
  const { alias, setAlias } = useContext(ShortContext);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [value] = useDebounce(alias, 300);

  const mutation = trpc.availableSlug.useMutation();

  useEffect(() => {
    if ((error || success) && alias === "") {
      setSuccess("");
      setError("");
    }

    if (alias && alias !== props.alias) {
      mutation.mutate(alias, {
        onSuccess() {
          setError("");
          setSuccess("Available");
        },
        onError(error) {
          setError(error.message);
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
        ${error && "border-red-400"} ${success && "border-green-400"}`}
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
      />
      <div className="text-md text-center text-green-600">{success}</div>
      <div className="text-md text-center text-red-600">{error}</div>
    </>
  );
}
