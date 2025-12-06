import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 1MB helyett 10MB lesz a limit a feltöltésnél
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Ez engedélyezi a külső képek (pl. Supabase) betöltését
      },
    ],
  },
};

export default nextConfig;