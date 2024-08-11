import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on the current mode (development or production)
  const env = loadEnv(mode, __dirname);

  // Create an array of plugins
  const plugins = [react()];

  // Conditionally add the visualizer plugin only for the build command
  if (command === "build") {
    plugins.push(
      visualizer({
        filename: "bundle-visualizer.html",
        open: true,
      })
    );
  }

  // Correct the path to SSL files for development
  const serverConfig = {};
  if (mode === 'development') {
    serverConfig.https = {
      key: fs.readFileSync(
        path.resolve(__dirname, "../file-server/ssl/localhost-key.pem")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "../file-server/ssl/localhost.pem")
      ),
    };
  }

  return {
    plugins,
    server: {
      ...serverConfig,
      proxy: {
        "/api": {
          target: "https://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
        "/sse": {
          target: "https://localhost:3000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    define: {
      "import.meta.env.VITE_LOG_LEVEL": JSON.stringify(env.VITE_LOG_LEVEL),
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@ag-grid-community")) {
                return "ag-grid";
              }
              if (id.includes("chart.js")) {
                return "chartjs";
              }
              if (id.includes("react-icons")) {
                return "react-icons";
              }
              return "vendor";
            }
          },
        },
      },
    },
  };
});
