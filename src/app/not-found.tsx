import Link from "next/link";
import { SearchX } from "lucide-react";
import { Empty } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="px-10 py-24">
      <Empty
        icon={SearchX}
        title="That page does not exist"
        hint="The demo data may have been reset. Head back to the project list."
        action={
          <Link href="/" className="btn">
            Back to projects
          </Link>
        }
      />
    </div>
  );
}
