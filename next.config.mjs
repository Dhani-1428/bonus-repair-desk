/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Mark nodemailer as external for server-side rendering
  serverComponentsExternalPackages: ['nodemailer'],
  // For API routes, we need to ensure nodemailer is available
  experimental: {
    serverComponentsExternalPackages: ['nodemailer'],
  },
}

export default nextConfig
