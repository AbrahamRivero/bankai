import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import queryClient from "@/query-client";

type BanWorkspaceUserRequest = {
  userId: string;
  banReason?: string;
};

function useBanWorkspaceUser() {
  return useMutation({
    mutationFn: async ({ userId, banReason }: BanWorkspaceUserRequest) => {
      const { data, error } = await authClient.admin.banUser({
        userId,
        banReason: banReason ?? "Banned by workspace admin",
      });

      if (error) {
        throw new Error(error.message || "Failed to ban user");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-users"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", "full"] });
    },
  });
}

export default useBanWorkspaceUser;
