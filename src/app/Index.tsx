import CurrentUpdatingShort from "@/components/current-updating-short";
import CustomAlias from "@/components/custom-alias";
import HistorySection from "@/components/history-section";
import ShortInput from "@/components/short-input";
import { IShortOutput } from "@/server/type";

interface Props {
  data?: IShortOutput;
}

export default function Index(props: Props) {
  return (
    <div>
      <div className="flex flex-col items-center mt-20">
        <div className="text-4xl">Keep Calm and Short Links</div>
        <div className="text-slate-400 italic text-sm mt-2">
          Make your huge links into small links with zero effort
        </div>
      </div>
      {props.data && <CurrentUpdatingShort data={props.data} />}
      <div className="flex flex-col justify-center mt-20 ">
        <ShortInput data={props.data} />
        <div className="mt-10 flex flex-col">
          <CustomAlias alias={props.data?.slug} />
        </div>
      </div>

      <div className="flex flex-col items-center m-20">
        <HistorySection data={props.data} />
      </div>
    </div>
  );
}
