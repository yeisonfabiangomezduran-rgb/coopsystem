export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] space-y-7 px-5 py-8 sm:px-8 lg:px-12 lg:py-9 ${className}`}>
      {children}
    </div>
  );
}
