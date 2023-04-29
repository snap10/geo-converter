import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills'



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    vue(),
    Components({
      dts: true,
    }),
    AutoImport({
      imports: [
        "vue",
        "vitest",
      ],
      eslintrc: {
        enabled: true,
      },
    }),

  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: 3000,
  },

})
