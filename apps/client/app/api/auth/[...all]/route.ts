import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

async function proxy(request: NextRequest, method: string) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth", "/api/auth");
  const apiUrl = `${API_URL}${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const response = await fetch(apiUrl, {
      method,
      headers,
      body:
        method === "GET" || method === "HEAD"
          ? undefined
          : await request.text(),
      redirect: "manual",
    });

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    const nextResponse = NextResponse.json(body, {
      status: response.status,
    });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to authentication server" },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  return proxy(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxy(request, "POST");
}
