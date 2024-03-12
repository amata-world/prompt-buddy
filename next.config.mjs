/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...(config.resolve?.fallback || {}),
        fs: false,
        path: false,
        os: false,
        perf_hooks: false,
      },
    };

    return config;
  },
};

export default nextConfig;
