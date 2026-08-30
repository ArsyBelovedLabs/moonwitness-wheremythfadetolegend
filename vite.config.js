import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = process.env.VITE_BASE_PATH || "/"

function copyDataAssets() {
  return {
    name: "copy-data-assets",
    apply: "build",
    closeBundle() {
      const from = path.resolve(__dirname, "data")
      const to = path.resolve(__dirname, "dist/data")
      fs.cpSync(from, to, { recursive: true })
    },
  }
}

export default defineConfig({
  base: basePath.endsWith("/") ? basePath : `${basePath}/`,
  plugins: [react(), tailwindcss(), copyDataAssets()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})
