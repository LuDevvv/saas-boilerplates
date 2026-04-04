import { SettingsLayout } from "./SettingsLayout";
import { ProfileForm } from "./ProfileForm";

export function SettingsProfileView() {
  return (
    <SettingsLayout activeTab="profile">
      <ProfileForm />
    </SettingsLayout>
  );
}
