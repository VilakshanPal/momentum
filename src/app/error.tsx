"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-10 py-20 text-center">
      <p className="text-ink">Something went wrong.</p>
      <p className="text-xs text-ink-3 mt-1 max-w-md mx-auto break-words">{error.message}</p>
      <button className="btn mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
