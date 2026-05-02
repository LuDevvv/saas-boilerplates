import { FC } from "react";

export const UserEmptyState: FC = () => {
  return (
    <div className="flex h-96 w-full items-center justify-center text-gray-500 font-heading">
      No users found.
    </div>
  );
};