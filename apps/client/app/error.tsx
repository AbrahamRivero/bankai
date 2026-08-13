"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-medium">Something went wrong</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
