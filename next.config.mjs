/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ipfs.io',
          pathname: '/ipfs/**',
        },
        {
          protocol: 'https',
          hostname: '**.ipfs.dweb.link',
        },
        {
          protocol: 'https',
          hostname: 'gateway.pinata.cloud',
          pathname: '/ipfs/**',
        }
      ],
    },
  };
  
  export default nextConfig;