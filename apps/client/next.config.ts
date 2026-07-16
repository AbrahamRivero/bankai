import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["better-auth"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
