import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

export function useSignOut() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign out",
      );
    },
  });
}
