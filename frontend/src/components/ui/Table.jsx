export default function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left ${className}`}>{children}</table>
    </div>
  );
}
