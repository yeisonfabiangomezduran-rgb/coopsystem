export default function PageHeader({ eyebrow, title, subtitle, action, aside }) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-base font-medium text-slate-500">{subtitle}</p>
      </div>
      {action || aside}
    </section>
  );
}
