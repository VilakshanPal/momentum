export default function Loading() {
  return (
    <div className="w-full max-w-[1104px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-3" aria-busy>
      <div className="skeleton h-9 w-72" />
      <div className="skeleton h-4 w-96" />
      <div className="grid min-[1200px]:grid-cols-2 gap-8 mt-6">
        <div className="skeleton h-80" />
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}
