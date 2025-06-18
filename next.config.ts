import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
<<<<<<< HEAD
  serverActions: {
    allowedOrigins: ["http://localhost:9002", "https://*.vercel.app"],
    bodySizeLimit: '1mb'
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
=======
  /* config options here */
>>>>>>> origin/main
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
<<<<<<< HEAD
        pathname: '/**'
      }
    ]
  }
=======
        pathname: '/**',
      },
    ],
  },
>>>>>>> origin/main
};

export default nextConfig;
