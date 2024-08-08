import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development or production)
  const env = loadEnv(mode, __dirname);

  return {
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
    },
    define: {
      "import.meta.env.VITE_LOG_LEVEL": JSON.stringify(env.VITE_LOG_LEVEL)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            }
          }
        }
      }
    }
  };
});
