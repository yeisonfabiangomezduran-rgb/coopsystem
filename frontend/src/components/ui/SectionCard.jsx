import Card from "./Card";

export default function SectionCard({ title, children, className = "" }) {
  return (
    <Card className={className}>
      <h3 className="mb-6 text-lg font-extrabold tracking-tight text-slate-900">
        {title}
      </h3>

      {children}
    </Card>
  );
}
