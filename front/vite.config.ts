import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 6540,
		proxy: {
			"/api": {
				target: process.env.DEV_API || "http://localhost:3000",
				changeOrigin: true,
			},
		},
		fs: {
			// Allow serving ../shared (schemas shared with back/) from the dev server.
			allow: [path.resolve(import.meta.dirname, "..")],
		},
	},
	build: {
		minify: "esbuild",
	},
	esbuild: {
		pure: ["console.log"],
		drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
	},
});
