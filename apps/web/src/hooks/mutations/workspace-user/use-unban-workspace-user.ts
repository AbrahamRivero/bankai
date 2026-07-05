import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import queryClient from "@/query-client";

type UnbanWorkspaceUserRequest = {
  userId: string;
};

function useUnbanWorkspaceUser() {
  return useMutation({
    mutationFn: async ({ userId }: UnbanWorkspaceUserRequest) => {
      const { data, error } = await authClient.admin.unbanUser({
        userId,
      });

      if (error) {
        throw new Error(error.message || "Failed to unban user");
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

export default useUnbanWorkspaceUser;
