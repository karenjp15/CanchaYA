"use client";

import dynamic from "next/dynamic";
import { ProfileFormLoading } from "@/components/profile/profile-form-loading";

const ProfileForm = dynamic(
  () =>
    import("@/components/profile/profile-form").then((m) => m.ProfileForm),
  {
    ssr: false,
    loading: () => <ProfileFormLoading />,
  },
);

type ProfileFormLazyProps = {
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
};

export function ProfileFormLazy({ profile }: ProfileFormLazyProps) {
  return <ProfileForm profile={profile} />;
}
