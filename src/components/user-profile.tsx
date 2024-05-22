"use cilent";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthDropdown from "./auth-dropdown";

import { useAuthAPIQuery } from "@/auth";
import { DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import UserAvatar from "./user-avatar";
import { useQueryClient } from "@tanstack/react-query";

export const UserProfile = () => {
  const router = useRouter();

  const { GetMe, LogOut } = useAuthAPIQuery();
  const { mutate: logOut } = LogOut();
  const { data } = GetMe();
  const queryClient = useQueryClient();

  async function onLogout() {
    logOut(undefined, {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: ["authAPIQuery.GetMe"],
        });
        router.push("/");
        toast.success("Successful");
      },
      onError(error, variables, context) {
        toast.error(error.message);
      },
    });
  }

  const before = (
    <>
      <DropdownMenuItem>{data?.name}</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => router.push("/user/profile")}>
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </>
  );

  const after = (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
    </>
  );

  const trigger = <UserAvatar avatar={data?.avatar} size={50} />;

  return <AuthDropdown trigger={trigger} before={before} after={after} />;
};
