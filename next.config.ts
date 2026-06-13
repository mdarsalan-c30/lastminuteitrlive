import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["pdf-parse"],
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
