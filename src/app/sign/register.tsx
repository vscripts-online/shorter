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
import { useContext } from "react";
import { SignContext } from "./page";
import { trpc } from "@/utils/trpc";

export default function Register() {
  const {
    setLogin,
    setRegisterPassword,
    updateEmail,
    email: _email,
  } = useContext(SignContext);

  const formSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: _email || "",
    },
  });

  const mutation = trpc.checkEmailRegistered.useMutation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateEmail(values.email);
    mutation.mutate(values.email, {
      onSuccess: () => setRegisterPassword(),
      onError(error, variables, context) {
        form.setError("email", { message: error.message });
      },
    });
  }

  return (
    <Form {...form}>
      <div className="text-center">Sign up</div>
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
        <div className="flex flex-col items-center gap-2">
          <Button type="submit">Continue</Button>
          <div>or</div>
          <div
            className="text-sky-800 cursor-pointer underline"
            onClick={setLogin}
          >
            Sign in
          </div>
        </div>
      </form>
    </Form>
  );
}
