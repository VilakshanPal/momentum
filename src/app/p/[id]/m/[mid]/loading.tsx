export default function Loading() {
  return (
    <div className="px-10 py-6 flex flex-col gap-3" aria-busy>
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-7 w-72" />
      <div className="grid grid-cols-2 gap-10 mt-4">
        <div className="skeleton h-80" />
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}
