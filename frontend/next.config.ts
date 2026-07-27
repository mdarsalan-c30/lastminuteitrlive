import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // VPS deploys build into a separate directory, then swaps it into place.
  // This prevents the live server from losing CSS/JS while `next build` runs.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/#pricing",
        permanent: false,
      },
      {
        source: "/file/onboarding/case-matrix",
        destination: "/file/onboarding/eligibility",
        permanent: true,
      },
      {
        source: "/file/onboarding/itr-path",
        destination: "/file/onboarding/eligibility",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
