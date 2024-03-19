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
import { useContext, useState } from "react";
import { SignContext } from "./page";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";

export default function RegisterPassword() {
  const router = useRouter();

  const { setSign, email } = useContext(SignContext);
  const [error, setError] = useState("");

  const formSchema = z
    .object({
      password: z.string().min(8),
      confirm: z.string().min(8),
    })
    .refine((data) => data.password === data.confirm, {
      path: ["confirm"],
      message: "Passwords did not match",
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const mutation = trpc.auth.register.useMutation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { confirm, password } = values;
    mutation.mutate(
      { email, password },
      {
        onSuccess() {
          router.push("/");
        },
        onError(error, variables, context) {
          setError(error.message);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <div className="text-center">Sign up</div>
      <div className="text-center my-3 text-red-700">{error}</div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
        <div className="flex flex-col items-center gap-2">
          <Button type="submit">Continue</Button>
          <div>or</div>
          <div
            className="text-sky-800 cursor-pointer underline"
            onClick={() => setSign("login")}
          >
            Sign in
          </div>
        </div>
      </form>
    </Form>
  );
}
