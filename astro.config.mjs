import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

export default defineConfig({
  integrations: [react()],
  image: {
    domains: ["lh3.googleusercontent.com"],
  },
  output: "server",
  adapter: node({ mode: "standalone" }),
});
