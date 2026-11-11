import { defineConfig } from "vite";
import { resolve } from "node:path";

const pages = [
  "smart-call",
  "plans",
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
        spanishPlans: resolve(import.meta.dirname, "es", "planes", "index.html"),
        spanishWorkspace: resolve(import.meta.dirname, "es", "workspace", "index.html"),
        smartCallControl: resolve(import.meta.dirname, "workspace", "smart-call", "index.html"),
        spanishSmartCallControl: resolve(import.meta.dirname, "es", "workspace", "smart-call", "index.html"),
        ...Object.fromEntries(
          pages.filter((page) => page !== "workspace" && page !== "plans").map((page) => ["es-" + page, resolve(import.meta.dirname, "es", page, "index.html")])
        ),
      },
    },
  },
});
