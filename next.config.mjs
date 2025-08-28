/** @type {import('next').NextConfig} */
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  publicRuntimeConfig: {
    env: process.env.NEXT_PUBLIC_ENV,
    apiURL: process.env.NEXT_PUBLIC_API_URL,
    attendanceURL: process.env.NEXT_PUBLIC_ATTENDANCE_URL,
    appURL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default bundleAnalyzer(nextConfig);
