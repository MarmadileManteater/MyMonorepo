import { defineConfig } from 'astro/config'
import { imagetools } from 'vite-imagetools'
import { cleanUpImagesIn } from '@marmadilemanteater/astro-plugins/clean-images'
import prettify from '@liquify/prettify'
import { fileURLToPath } from 'url'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
// https://astro.build/config
export default defineConfig({
  site: 'https://marmadilemanteater.dev',
  publicDir: '../../packages/static-data/public',
  integrations: [
    /** remove unused images from the output */
    cleanUpImagesIn(
      ['images/'],
      true // check all subfolders
    ),
    {
      name: '💄 Pretty print HTML w/ @liquify/prettify',
      hooks: {
        'astro:build:done': async function (options) {
          const outputDir = fileURLToPath(options.dir)
          const outputFiles = options.pages.map(({
            pathname
          }) => join(outputDir, pathname, 'index.html'))
          for (const file of outputFiles) {
            const html = (await readFile(file)).toString()
            const prettyHtml = await prettify.format(`<!-- 🎀prettified by @liquify/prettify https://www.npmjs.com/package/@liquify/prettify -->${html
              .replace(/<!--[^>-]*?-->/g, '\r\n')
              .replace(/<!-- [a-zA-Z0-9-_]*? -->/g, '\r\n')
              .replace(/> </g, '>\r\n<')
              .replace(/></g, '>\r\n<')}`, {
              language: 'html',
              markup: {
                attributeSort: true,
                forceLeadAttribute: true,
                ignoreScripts: true
              }
            })
            await writeFile(file, prettyHtml)
            console.log(`💄 Pretty printed '${file}'`)
          }
        }
      }
    }
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
