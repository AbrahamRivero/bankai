"use client";

import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-border/40 bg-background flex h-14 items-center justify-between border-b px-6">
        <h1 className="text-foreground text-lg font-medium">Kaneo</h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-muted-foreground text-sm">{user.email}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-foreground text-2xl font-medium">
            Welcome{user?.name ? `, ${user.name}` : ""}!
          </h2>
          <p className="text-muted-foreground mt-2">
            You are signed in and ready to go.
          </p>
        </div>
      </main>
    </div>
  );
}
