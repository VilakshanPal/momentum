export default function Loading() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-3" aria-busy>
      <div className="skeleton h-9 w-72 mb-5" />
      <div className="skeleton h-28 min-[1200px]:max-w-[calc(100%-360px)]" />
      <div className="skeleton h-28 min-[1200px]:max-w-[calc(100%-360px)]" />
      <div className="skeleton h-28 min-[1200px]:max-w-[calc(100%-360px)]" />
    </div>
  );
}
