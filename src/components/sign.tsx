import { AuthAPI, useAuthAPIQuery } from "@/auth";
import AuthDropdown from "./auth-dropdown";
import { Button } from "./ui/button";
import { UserProfile } from "./user-profile";
import { useRouter } from "next/navigation";

export const SignButton = ({ onClick }: { onClick?: () => any }) => {
  return (
    <Button
      variant="shine"
      onClick={onClick}
      className="bg-sky-400 from-sky-700 via-sky-700/50 to-sky-700"
    >
      Sign In
    </Button>
  );
};

export default function Sign() {
  const router = useRouter();
  const { GetMe, ListUsers } = useAuthAPIQuery();

  const { data, error } = GetMe();
  const { data: users } = ListUsers();

  if (!data && users && users.length > 0)
    return <AuthDropdown trigger={<SignButton />} />;

  if (!error && !!data) return <UserProfile />;

  function redirectToLogin() {
    router.push(AuthAPI.loginURL);
  }

  return <SignButton onClick={redirectToLogin} />;
}
