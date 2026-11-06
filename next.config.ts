import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	reactStrictMode: true,
	output: "standalone",
	async redirects() {
		return [{ source: "/d/link", destination: "/d/links", permanent: false }]
	},
}

export default nextConfig
