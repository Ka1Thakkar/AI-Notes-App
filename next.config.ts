// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      // allow Google avatars
      "lh3.googleusercontent.com",
      // any other hosts you expect
    ],
  },
};

module.exports = nextConfig;