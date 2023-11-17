import { defineConfig } from 'astro/config'
import { imagetools } from 'vite-imagetools'
import { fileURLToPath } from 'url'
import { join } from 'path'
import { readFile, readdir, rm, stat } from 'fs/promises'
import jsdom from 'jsdom'

const {
  JSDOM
} = jsdom

export function cleanUpImagesIn(...directories) {
  return {
    name: '🧹Clean up unused images',
    hooks: {
      /**
       * @param {{ dir: URL; routes: RouteData[], pages: { pathname: string }[] }} options
       */
      'astro:build:done': async function (options) {
        const outputDir = fileURLToPath(options.dir);
        const outputFiles = options.pages.map(({
          pathname
        }) => join(outputDir, pathname, 'index.html'));
        const imagesFound = [];
        for (const file of outputFiles) {
          const htmlAsString = (await readFile(file)).toString();
          if (htmlAsString.indexOf('background-image:url') !== -1) {
            imagesFound.push(Array.from(htmlAsString.matchAll(/background-image:url\(([^)]*?)\)/g)).map(regex => regex[1])[0]);
          }
          const dom = new JSDOM(htmlAsString);
          const images = Array.from(dom.window.document.querySelectorAll(directories.map(directory => `[src^="/${directory}"]`).join(', '))).map(element => element.getAttribute('src'));
          const links = Array.from(dom.window.document.querySelectorAll(directories.map(directory => `[href^="/${directory}"]`).join(', '))).map(element => element.getAttribute('href'));
          imagesFound.push(...images);
          imagesFound.push(...links);
        }
        const filesToKeep = Array.from(new Set(imagesFound));
        for (const directory of directories) {
          const path = join(outputDir, directory);
          const filesFound = await readdir(path);
          for (const file of filesFound) {
            const relativePath = join(`/${directory}`, file).replaceAll('\\', '/');
            if (filesToKeep.indexOf(relativePath) === -1) {
              const filePath = join(path, file);
              if (!(await stat(filePath)).isDirectory()) {
                // file found in output directory, but not referenced in any html file
                console.log(`🧹 Removing unused image: ${relativePath}`);
                await rm(filePath);
              }
            }
          }
        }
      }
    }
  };
}


// https://astro.build/config
export default defineConfig({
  site: 'https://marmadilemanteater.dev',
  publicDir: '../../packages/static-data/public',
  integrations: [
    /** remove unused images from the output */
    cleanUpImagesIn('images/', 'images/emoji/twemoji', 'images/emoji/mutantstd', 'images/thumbnails/', 'images/logos/')
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
