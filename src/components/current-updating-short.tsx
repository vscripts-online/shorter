import { IShortOutput } from "@/server/type";
import { ShortContext } from "@/app/providers/short.context";
import { ArrowLeftFromLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";

interface Props {
  data?: IShortOutput;
}

export default function CurrentUpdatingShort(props: Props) {
  const { setAlias, setLink } = useContext(ShortContext);
  const router = useRouter();

  function handleClick() {
    setAlias("");
    setLink("");
    router.push("/");
  }

  return (
    <div className="mt-20 flex flex-col justify-center items-center ">
      <div
        className="flex gap-2 px-3 mb-3 cursor-pointer border-b-2 border-transparent hover:border-b-2 hover:border-black"
        onClick={handleClick}
      >
        <ArrowLeftFromLine /> Go Back
      </div>
      <div>
        You are currently updating:{" "}
        <span className="text-purple-700">/{props.data?.slug}</span>
      </div>
    </div>
  );
}
