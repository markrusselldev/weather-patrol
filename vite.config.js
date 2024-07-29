import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../toa5-file-server/ssl/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../toa5-file-server/ssl/localhost.pem"))
    },
    proxy: {
      "/api": {
        target: "https://localhost:3000",
        changeOrigin: true,
        secure: false
      },
      "/sse": {
        target: "https://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});
