import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-medium">Page not found</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Go Home
      </Button>
    </div>
  );
}
