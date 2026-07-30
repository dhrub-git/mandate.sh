/** @type {import('next').NextConfig} */
const nextConfig = {
   serverExternalPackages: ["@lancedb/lancedb", "apache-arrow","promptfoo", "puppeteer" , "jsdom"],
};

export default nextConfig;
