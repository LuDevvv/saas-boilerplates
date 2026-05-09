import { EmptyState } from "@node-stack/ui";
import { LucideIcon } from "lucide-react";
import { FC, ReactNode } from "react";

interface EmptyStateMessageProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

const EmptyStateMessage: FC<EmptyStateMessageProps> = ({
  icon,
  title,
  message,
  action,
  className,
}) => {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={message}
      action={action}
      className={className}
    />
  );
};

export default EmptyStateMessage;
