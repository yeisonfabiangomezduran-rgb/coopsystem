import Card from "./Card";

export default function DataSection({
  title,
  description,
  action,
  children,
  className = "",
  headerClassName = "flex flex-col gap-2 border-b border-[#dce5ed] px-6 py-5 sm:flex-row sm:items-center sm:justify-between",
  titleClassName = "text-xl font-extrabold tracking-tight text-[#1B2A41]",
}) {
  return (
    <Card className={className}>
      <div className={headerClassName}>
        <div>
          <h2 className={titleClassName}>{title}</h2>
          {description && <p className="mt-1 text-sm font-medium text-[#536273]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
