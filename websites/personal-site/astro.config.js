import { defineConfig } from 'astro/config'
import { imagetools } from 'vite-imagetools'
import { cleanUpImagesIn } from '@marmadilemanteater/astro-plugins/clean-images'
// https://astro.build/config
export default defineConfig({
  site: 'https://marmadilemanteater.dev',
  publicDir: '../../packages/static-data/public',
  integrations: [
    /** remove unused images from the output */
    cleanUpImagesIn(
      ['images/'],
      true // check all subfolders
    )
  ],
  vite: {
    plugins: [imagetools()],
    build: {
      /*
      assetsInlineLimit: Infinity,
      */
    }
  }
});
