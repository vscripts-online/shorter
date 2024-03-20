import { IShortOutput } from "@/server/type";
import { RotateCcw } from "lucide-react";
import HistoryTable from "./history-table";
import { useState } from "react";
import { trpc } from "@/utils/trpc";

interface Props {
  data?: IShortOutput;
}

export default function HistorySection(props: Props) {
  const [fetching, setFetching] = useState(false);

  const utils = trpc.useUtils();
  const { refetch } = utils.short.getHistory;

  const onFetchChange = (fetch: boolean) => {
    setFetching(fetch);
  };

  async function handleClick() {
    setFetching(true);
    await refetch();
    setFetching(false);
  }

  return (
    <>
      <div className="flex items-center gap-5 mb-3">
        <div>Shorting History</div>
        <div
          className="cursor-pointer hover:bg-gray-50 p-2 rounded-full"
          onClick={handleClick}
        >
          <RotateCcw
            size="1.3rem"
            className={`${fetching && "reverse-spin"}`}
          />
        </div>
      </div>
      <HistoryTable data={props.data} onFetchChange={onFetchChange} />
    </>
  );
}
