"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { LoaderIcon } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import { useEffect } from "react";

const publicReadingListSettingsSchema = z.object({
  isSharingReadingList: z.boolean(),
});

type PublicReadingListFormValues = z.infer<
  typeof publicReadingListSettingsSchema
>;

export default function PublicReadingListSettingsForm() {
  const { data: user } = api.userProfile.getProfile.useQuery();

  const form = useForm<PublicReadingListFormValues>({
    resolver: zodResolver(publicReadingListSettingsSchema),
    defaultValues: {
      isSharingReadingList: user?.isSharingReadingList ?? false,
    },
  });

  const updateReadingListSharing =
    api.userProfile.updateReadingListSharing.useMutation({
      onSuccess: () => {
        toast.success("Reading list settings updated successfully");
        form.reset();
      },
      onError: (error) => {
        toast.error(`Error changing reading list settings: ${error.message}`);
      },
    });

  function onSubmit(data: PublicReadingListFormValues) {
    updateReadingListSharing.mutate(data);
  }

  useEffect(() => {
    form.setValue("isSharingReadingList", user?.isSharingReadingList ?? false);
  }, [form, user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Reading List Settings</CardTitle>
        <CardDescription>
          Manage your public reading list settings here. You can choose to share
          or hide your reading list from others.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="isSharingReadingList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Share my reading list publicly</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateReadingListSharing.isPending}>
              {updateReadingListSharing.isPending && (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
