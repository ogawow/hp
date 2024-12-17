/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/your-repo-name', // GitHubリポジトリ名に置き換えてください
  assetPrefix: '/your-repo-name/', // GitHubリポジトリ名に置き換えてください
}

module.exports = nextConfig

