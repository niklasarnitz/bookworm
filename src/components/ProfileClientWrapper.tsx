"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

import ProfileForm from "~/components/profile/ProfileForm";
import PasswordChangeForm from "~/components/profile/PasswordChangeForm";
import { AvatarUploader } from "~/components/AvatarUploader";

interface ProfileClientWrapperProps {
  profile: RouterOutputs["userProfile"]["getProfile"];
}

export const ProfileClientWrapper = ({
  profile,
}: Readonly<ProfileClientWrapperProps>) => {
  const [activeTab, setActiveTab] = useState("profile");

  const utils = api.useUtils();

  const handleAvatarUpload = async () => {
    // After successful upload, invalidate the profile query to show the updated avatar
    await utils.userProfile.getProfile.invalidate();
  };

  return (
    <Tabs
      defaultValue="profile"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="avatar">Avatar</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileForm profile={profile} />
      </TabsContent>
      <TabsContent value="avatar" className="space-y-4 py-4">
        <div className="mx-auto max-w-md">
          <AvatarUploader
            onImageUpload={handleAvatarUpload}
            defaultImageUrl={profile?.image ?? undefined}
            name={profile?.name ?? undefined}
          />
        </div>
      </TabsContent>
      <TabsContent value="password">
        <PasswordChangeForm />
      </TabsContent>
    </Tabs>
  );
};
