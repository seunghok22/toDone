import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@todone/ui", "@todone/store", "@todone/utils", "@todone/types"],
  allowedDevOrigins: ['192.168.50.16'],
};

export default withPWA(nextConfig);
