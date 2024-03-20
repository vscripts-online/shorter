import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";

export default function Sign() {
  const router = useRouter();

  const { data } = trpc.user.getMe.useQuery();
  const mutation = trpc.user.logout.useMutation();

  function onClick() {
    !data && router.push("/sign");
  }

  function handleLogout() {
    mutation.mutate(undefined, {
      onSuccess() {
        window.location.reload();
      },
    });
  }

  return (
    <>
      {!data && (
        <button
          className="py-2 px-5 rounded bg-rose-400 text-white"
          onClick={onClick}
        >
          Sign
        </button>
      )}
      {data && (
        <div className="flex flex-col items-center">
          <div className="text-sm mb-1">{data}</div>
          <button
            className="rounded py-1 px-3 bg-rose-400 text-white"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
}
