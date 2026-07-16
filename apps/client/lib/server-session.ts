import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

export async function getServerSession() {
  try {
    const h = await headers();
    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: { cookie: h.get("cookie") || "" },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data as {
      user: { id: string; name: string; email: string; image?: string | null };
    } | null;
  } catch (error) {
    console.error("getServerSession error:", error);
    return null;
  }
}
