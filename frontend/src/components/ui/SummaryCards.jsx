import StatCard from "./StatCard";

export default function SummaryCards({ items, className = "" }) {
  return (
    <section className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {items.map(({ id, ...card }) => <StatCard key={id ?? card.title} {...card} />)}
    </section>
  );
}
