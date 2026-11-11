import { defineConfig } from "vite";
import { resolve } from "node:path";

const pages = [
  "smart-call",
  "ai-agents",
  "web-services",
  "inventory",
  "scheduling",
  "crm-leads",
  "business-operations",
  "marketing-analytics",
  "automations",
  "workspace",
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        ...Object.fromEntries(
          pages.map((page) => [page, resolve(import.meta.dirname, page, "index.html")])
        ),
        spanishHome: resolve(import.meta.dirname, "es", "index.html"),
        spanishWorkspace: resolve(import.meta.dirname, "es", "workspace", "index.html"),
        ...Object.fromEntries(
          pages.filter((page) => page !== "workspace").map((page) => ["es-" + page, resolve(import.meta.dirname, "es", page, "index.html")])
        ),
      },
    },
  },
});
