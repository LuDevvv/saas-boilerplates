interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 py-8">
      <h1 className="text-3xl font-heading ">{title}</h1>
      {description && (
        <p className="text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
