import { FC, ReactNode } from "react";

interface UserRowProps {
  children: ReactNode;
}

export const UserRow: FC<UserRowProps> = ({ children }) => {
  return (
    <tr className="group hover:bg-surface-hover transition-colors">
      {children}
    </tr>
  );
};