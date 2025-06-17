import path from 'path';


/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheHandler: path.resolve('./cache-handler.mjs'),
  cacheMaxMemorySize: 0, // disable default in-memory caching
  
  staticPageGenerationTimeout: 20000,
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "sih.cincmedia.com",
            port: "",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "hello-condo-icons-dev.s3.amazonaws.com",
            port: "",
            pathname: "/**",
          },
          {
            protocol: "https",
            hostname: "dev-hello-condo-admin-assests.s3.amazonaws.com",
            port: "",
            pathname: "/**",
          },
        ],
        dangerouslyAllowSVG: true,
      },
};

export default nextConfig;
