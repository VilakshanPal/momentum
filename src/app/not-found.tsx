import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-10 py-20 text-center">
      <p className="text-ink-2">That page does not exist, or the demo data was reset.</p>
      <Link href="/" className="btn mt-4">
        Back to projects
      </Link>
    </div>
  );
}
