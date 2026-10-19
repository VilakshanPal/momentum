export default function Loading() {
  return (
    <div className="px-10 py-6 flex flex-col gap-3" aria-busy>
      <div className="skeleton h-5 w-40" />
      <div className="skeleton h-12" />
      <div className="skeleton h-12" />
      <div className="skeleton h-12" />
    </div>
  );
}
