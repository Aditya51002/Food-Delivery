import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // Forward cookies (needed for httpOnly refreshToken cookie)
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            // Allow Set-Cookie to reach the browser in dev
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
                cookie.replace(/; secure/gi, "").replace(/; samesite=strict/gi, "; SameSite=Lax")
              );
            }
          });
        },
      },
    },
  },
});
