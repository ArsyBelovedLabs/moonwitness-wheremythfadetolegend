import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = process.env.VITE_BASE_PATH || "/"

export default defineConfig({
  base: basePath.endsWith("/") ? basePath : `${basePath}/`,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})
