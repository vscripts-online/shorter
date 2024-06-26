import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IShortOutput } from "@/server/type";
import { trpc } from "@/utils/trpc";
import { Ellipsis, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthAPIQuery } from "@/auth";

interface DeleteDialogProps {
  value: string;
  onDelete: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function DeleteDialog(props: DeleteDialogProps) {
  const mutation = trpc.user.deleteShort.useMutation();

  const utils = trpc.useUtils();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();

    mutation.mutate(props.value, {
      onSuccess(data, variables, context) {
        toast({
          description: "Successfully deleted",
          className: "bg-green-700 text-white",
          duration: 1000,
        });
        props.setOpen(false);

        utils.short.getHistory.setInfiniteData({}, (data) => {
          if (!data) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              shorts: page.shorts.filter((x) => x._id !== props.value),
            })),
          };
        });
      },
      onError(error, variables, context) {
        toast({
          description: error.message,
          duration: 1000,
          variant: "destructive",
        });
      },
    });
  }

  function handleCancel() {
    props.setOpen(false);
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={(e) => handleDelete(e)}
            disabled={mutation.isPending}
          >
            Delete
            {mutation.isPending && <Loader2 className="animate-spin ml-5" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ActionMenuProps {
  value: string;
}

function ActionMenu(props: ActionMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  const { GetMe } = useAuthAPIQuery();
  const { data } = GetMe();

  function handleEdit() {
    router.push("/" + props.value);
  }

  function handleSelect(e: Event) {
    setModal(true);
    e.preventDefault();
  }

  return (
    <>
      <DeleteDialog
        value={props.value}
        onDelete={() => setOpen(false)}
        open={modal}
        setOpen={setModal}
      />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <TooltipProvider delayDuration={0}>
          <Tooltip open={data ? false : tooltip} onOpenChange={setTooltip}>
            <TooltipTrigger onMouseEnter={(e) => e.preventDefault()} asChild>
              <span className={`${!data && "cursor-not-allowed"}`}>
                <DropdownMenuTrigger
                  asChild
                  className={`${!data && "pointer-events-none"}`}
                >
                  <div
                    className={`border border-neutral-400 rounded-full py-1 px-2 cursor-pointer`}
                  >
                    <Ellipsis />
                  </div>
                </DropdownMenuTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Login required</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* <span className={`${!data && "cursor-not-allowed"}`}>
          <DropdownMenuTrigger
            asChild
            className={`${!data && "pointer-events-none"}`}
          >
            <div
              className={`border border-neutral-400 rounded-full py-1 px-2 cursor-pointer`}
            >
              <Ellipsis />
            </div>
          </DropdownMenuTrigger>
        </span> */}

        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer text-blue-900"
            onClick={handleEdit}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-900"
            onSelect={(e) => handleSelect(e)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

interface Props {
  data?: IShortOutput;
  onFetchChange: (data: boolean) => void;
}

export default function HistoryTable(props: Props) {
  const { data, fetchNextPage, isFetching } =
    trpc.short.getHistory.useInfiniteQuery(
      { cursor: 0 },
      {
        getNextPageParam: (lastPage, pages) => {
          const sum = pages.reduce((acc, val) => acc + val.shorts.length, 0);
          return sum;
        },
      }
    );

  props.onFetchChange(isFetching);

  const columns: ColumnDef<IShortOutput>[] = [
    {
      header: "#",
      cell({ row }) {
        return parseInt(row.id) + 1;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Date",
      cell({ row }) {
        const value = row.getValue("updatedAt") as string;
        return timeAgo.format(new Date(value));
      },
    },
    {
      header: "Slug",
      cell({ row }) {
        const slug = row.original.slug;
        return (
          <Link
            className={`${slug && "text-red-700"} underline`}
            href={`${process.env.NEXT_PUBLIC_REDIRECT_HOST}/${slug}`}
            target="blank"
          >
            {slug}
          </Link>
        );
      },
    },
    {
      accessorKey: "real_url",
      header: "Real Url",
      cell({ row }) {
        const value = row.getValue("real_url") as string;
        return <span className="truncate">{value.slice(0, 20)}</span>;
      },
    },
    {
      accessorKey: "clicked",
      header: "Clicked",
    },
    {
      header: "Action",
      cell({ row }) {
        const value = row.original._id;
        return <ActionMenu value={value} />;
      },
    },
  ];

  const columnData = () => {
    const pages_data = (data?.pages.map((x) => x.shorts) || []).flat();

    const current_data = pages_data.find((x) => x && x._id === props.data?._id);

    const filtered_data = pages_data.filter((x) => x._id !== props.data?._id);

    const result = [current_data, ...filtered_data].filter(
      (x) => x
    ) as IShortOutput[];

    return result;
  };

  const cachedValue = useMemo(() => columnData(), [data]);

  const table = useReactTable({
    columns,
    data: cachedValue,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="truncate">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`${
                    props.data?._id === row.original._id && "bg-purple-200"
                  } hover:bg-purple-100`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data?.pages.at(-1)?.hasMore && (
        <Button
          variant="outline"
          className="border border-black p-2 px-5 bg-white text-black mt-2 rounded-full"
          onClick={() => fetchNextPage()}
        >
          More
        </Button>
      )}
    </>
  );
}
