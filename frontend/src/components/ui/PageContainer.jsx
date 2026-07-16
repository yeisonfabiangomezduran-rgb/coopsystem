export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] space-y-9 px-5 py-9 sm:px-8 lg:px-12 lg:py-11 ${className}`}>
      {children}
    </div>
  );
}
