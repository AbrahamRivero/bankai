export type InstanceStatus = {
  hasUsers: boolean;
  hasAdmin: boolean;
};

export async function getInstanceStatus(): Promise<InstanceStatus> {
  const response = await fetch("/api/instance/status", {
    credentials: "include",
  });
  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.text()).trim();
    } catch {}
    throw new Error(
      detail
        ? `Failed to fetch instance status (${response.status}): ${detail}`
        : `Failed to fetch instance status (${response.status})`,
    );
  }
  return response.json();
}
