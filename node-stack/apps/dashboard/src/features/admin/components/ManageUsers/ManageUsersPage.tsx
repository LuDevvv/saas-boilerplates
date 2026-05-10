import { FC, ReactNode } from "react";

interface ManageUsersPageProps {
  children: ReactNode;
}

export const ManageUsersPage: FC<ManageUsersPageProps> = ({ children }) => (
  <>{children}</>
);
