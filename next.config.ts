import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
      //  reactStrictMode: false,
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'urbikpaalweogcclzyps.supabase.co',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      port: '',
      pathname: '/**',
    },
  ],
},
};

export default nextConfig;
