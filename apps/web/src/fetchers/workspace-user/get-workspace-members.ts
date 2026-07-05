import { getApiUrl } from "@/fetchers/get-api-url";

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  banned: boolean | null;
  role: string;
  createdAt: string;
};

async function getWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const url = getApiUrl(`workspace/${workspaceId}/members`);
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getWorkspaceMembers;
