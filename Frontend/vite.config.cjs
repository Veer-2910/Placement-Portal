const { defineConfig } = require("vite");
const path = require("path");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      allow: ["V:/UGSF WORK/UGSF-PLACEMENT PORTAL"],
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
