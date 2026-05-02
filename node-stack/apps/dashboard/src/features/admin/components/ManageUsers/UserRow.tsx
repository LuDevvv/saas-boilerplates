import { FC, ReactNode } from "react";

interface UserRowProps {
  children: ReactNode;
}

export const UserRow: FC<UserRowProps> = ({ children }) => {
  return (
    <tr className="group hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors">
      {children}
    </tr>
  );
};