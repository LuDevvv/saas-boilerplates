import { type FC, type ReactNode } from "react";
import { cn } from "@utils/classNames";

interface FooterProps {
  children: ReactNode;
  className?: string;
}

interface FooterLinkGroupProps {
  children: ReactNode;
  className?: string;
}

interface FooterLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

interface FooterBrandProps {
  children: ReactNode;
  className?: string;
}

interface FooterCopyrightProps {
  year?: number;
  by: string;
  className?: string;
}

const Footer: FC<FooterProps> & {
  LinkGroup: FC<FooterLinkGroupProps>;
  Link: FC<FooterLinkProps>;
  Brand: FC<FooterBrandProps>;
  Copyright: FC<FooterCopyrightProps>;
} = ({ children, className }) => {
  return (
    <footer
      className={cn(
        "w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
        className
      )}
    >
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </footer>
  );
};

const FooterLinkGroup: FC<FooterLinkGroupProps> = ({ children, className }) => {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}
    >
      {children}
    </div>
  );
};

const FooterLink: FC<FooterLinkProps> = ({
  href,
  children,
  className,
  external = false,
}) => {
  return (
    <a
      href={href}
      className={cn(
        "text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
        "transition-colors duration-200",
        "hover:underline underline-offset-4",
        className
      )}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
};

const FooterBrand: FC<FooterBrandProps> = ({ children, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
};

const FooterCopyright: FC<FooterCopyrightProps> = ({ year, by, className }) => {
  const currentYear = new Date().getFullYear();
  const displayYear = year ? `${year}-${currentYear}` : currentYear;

  return (
    <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>
      © {displayYear} {by}. All rights reserved.
    </p>
  );
};

Footer.LinkGroup = FooterLinkGroup;
Footer.Link = FooterLink;
Footer.Brand = FooterBrand;
Footer.Copyright = FooterCopyright;

export { Footer };
