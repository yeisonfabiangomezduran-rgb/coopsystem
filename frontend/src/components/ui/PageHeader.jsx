export default function PageHeader({ eyebrow, title, subtitle, action, aside }) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#245B8F]">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1B2A41] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-base font-medium text-[#536273]">{subtitle}</p>
      </div>
      {action || aside}
    </section>
  );
}
