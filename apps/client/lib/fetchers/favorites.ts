import { client } from "@/lib/api-client";

export async function addToFavorites(productId: string) {
  const workspaceId = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? "";
  const response = await client.products.favorites.$post({
    json: { productId, workspaceId },
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || "Failed to add to favorites");
    } catch {
      throw new Error(text || "Failed to add to favorites");
    }
  }

  return response.json();
}

export async function removeFromFavorites(productId: string) {
  const workspaceId = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? "";
  const response = await client.products.favorites[":productId"].$delete({
    param: { productId },
    query: { workspaceId },
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed.message || "Failed to remove from favorites");
    } catch {
      throw new Error(text || "Failed to remove from favorites");
    }
  }

  return response.json();
}
