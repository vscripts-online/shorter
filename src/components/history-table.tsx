import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
TimeAgo.addDefaultLocale(en);

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

import { IShortOutput } from "@/app/api/trpc/type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/utils/trpc";
import { Delete, Ellipsis, Loader2, Underline } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "./ui/use-toast";

interface DeleteDialogProps {
  value: string;
  onDelete: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function DeleteDialog(props: DeleteDialogProps) {
  const mutation = trpc.deleteShort.useMutation();
  const { refetch } = trpc.getHistory.useQuery();

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
        refetch();
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
        <DropdownMenuTrigger asChild>
          <div className="border border-neutral-400 rounded-full py-1 px-2">
            <Ellipsis />
          </div>
        </DropdownMenuTrigger>
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
}

export default function HistoryTable(props: Props) {
  const { data } = trpc.getHistory.useQuery();
  const timeAgo = new TimeAgo("en-US");

  const columns: ColumnDef<IShortOutput>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell({ row }) {
        const value = row.getValue("createdAt") as string;
        return timeAgo.format(new Date(value));
      },
    },
    {
      header: "Slug",
      cell({ row }) {
        const alias = row.original.alias;
        const slug = row.original.slug;
        const value = alias || slug;
        return (
          <Link
            className={`${alias && "text-red-700"} underline`}
            href={"https://httpbin.org/anything/" + value}
            target="blank"
          >
            {value}
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
    const filteredData = (
      (data?.shorts as unknown as IShortOutput[]) || []
    ).filter((x) => x && x._id !== props.data?._id);

    return [props.data, ...filteredData].filter((x) => x) as IShortOutput[];
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
                    props.data?._id === row.original._id && "bg-purple-100"
                  }`}
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
      {data?.hasMore && (
        <button className="border border-black p-2 px-5 bg-white text-black mt-2 rounded-full">
          More
        </button>
      )}
    </>
  );
}
