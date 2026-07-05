import { useQuery } from "@tanstack/react-query";
import getWorkspaceMembers from "@/fetchers/workspace-user/get-workspace-members";

type UseGetWorkspaceMembersRequest = {
  workspaceId?: string;
};

function useGetWorkspaceMembers({
  workspaceId,
}: UseGetWorkspaceMembersRequest) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    enabled: !!workspaceId,
    queryFn: () => getWorkspaceMembers(workspaceId as string),
  });
}

export default useGetWorkspaceMembers;
