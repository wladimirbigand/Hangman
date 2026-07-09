const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Le monorepo a un lockfile racine (ancienne app Vite) en plus de celui-ci ;
  // on fixe explicitement la racine de tracing sur web/ pour eviter toute ambiguite.
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
