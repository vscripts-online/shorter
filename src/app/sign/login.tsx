import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SignContext } from "./page";

export default function Login() {
  const { setSign } = useContext(SignContext);
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = trpc.auth.login.useMutation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    mutation.mutate(
      { email, password },
      {
        onSuccess() {
          router.push("/");
        },
        onError(error, variables, context) {
          if (error.message === "Wrong Password") {
            form.setError("password", { message: error.message });
          } else {
            form.setError("email", { message: error.message });
          }
        },
      }
    );
  }

  return (
    <Form {...form}>
      <div className="text-center">Sign in</div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="absolute">Password</FormLabel>
              <span className="float-right text-xs pb-1 cursor-pointer text-sky-700 underline">
                Forgot password?
              </span>
              <FormControl>
                <Input
                  placeholder="Strong Password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col items-center gap-3">
          <Button type="submit">Login</Button>
          <div>or</div>
          <div
            className="text-sky-800 cursor-pointer underline"
            onClick={() => setSign("register")}
          >
            Create an account
          </div>
        </div>
      </form>
    </Form>
  );
}
