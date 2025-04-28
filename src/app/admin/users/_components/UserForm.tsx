"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api, type RouterOutputs } from "~/trpc/react";
import { userCreateSchema, type userUpdateSchema } from "~/schemas/user";
import { toast } from "sonner";
import { type z } from "zod";

interface UserFormProps {
  user?: RouterOutputs["userManagement"]["getById"];
  mode: "create" | "edit";
}

// Define the exact types from the schemas to avoid inference issues
type CreateFormValues = z.infer<typeof userCreateSchema>;
type EditFormValues = z.infer<typeof userUpdateSchema>;

export function UserForm({ user, mode }: Readonly<UserFormProps>) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create mode form
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: user?.name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "USER",
    },
  });

  const createUserMutation = api.userManagement.create.useMutation({
    onSuccess: () => {
      toast("New user has been successfully created.");
      router.push("/admin/users");
      router.refresh();
    },
    onError: (error) => {
      toast(error.message ?? "Failed to create user");
      setIsSubmitting(false);
    },
  });

  const updateUserMutation = api.userManagement.update.useMutation({
    onSuccess: () => {
      toast("User has been successfully updated.");
      router.push("/admin/users");
      router.refresh();
    },
    onError: (error) => {
      toast(error.message ?? "Failed to update user");
      setIsSubmitting(false);
    },
  });

  function handleSubmit(data: CreateFormValues | EditFormValues) {
    setIsSubmitting(true);

    if (mode === "create") {
      createUserMutation.mutate(data);
    } else {
      updateUserMutation.mutate(data as EditFormValues);
    }
  }

  // Get button text based on state and mode
  const getButtonText = () => {
    if (isSubmitting) {
      return mode === "create" ? "Creating..." : "Updating...";
    }
    return mode === "create" ? "Create User" : "Update User";
  };

  // Use conditional rendering based on mode to avoid form type issues
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Name field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue="USER"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {getButtonText()}
          </Button>
        </div>
      </form>
    </Form>
  );
}
