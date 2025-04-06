import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  image: {
    domains: ['lh3.googleusercontent.com'],
  },
  
});
 