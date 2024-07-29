// postcss.config.js
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import postcssPresetEnv from "postcss-preset-env";

export default {
  plugins: [
    postcssImport,
    tailwindcss,
    autoprefixer,
    postcssPresetEnv({
      stage: 1,
      features: {
        "nesting-rules": true,
        "custom-properties": false // Let PostCSS handle custom properties
      }
    })
  ]
};
