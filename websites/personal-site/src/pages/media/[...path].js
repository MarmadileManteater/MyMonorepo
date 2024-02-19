// @ts-check
import { readFile, readdir, stat } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { fileTypeFromFile } from 'file-type'

const __dirname = dirname(fileURLToPath(new URL(import.meta.url)))

/**
 * @param {string} dir
 * @returns {Promise<Array<string>>}
 */
async function findAllFiles(dir, root = dir) {
  const outputFiles = []
  const files = await readdir(dir)
  for (const file of files) {
    const path = join(dir, file)
    const stats = await stat(path)
    if (stats.isDirectory()) {
      outputFiles.push(...(await findAllFiles(path, join(root, file).replaceAll('\\', '/'))))
    } else {
      outputFiles.push(join(root, file).replaceAll('\\', '/'))
    }
  }
  return outputFiles
}

export async function getStaticPaths() {
  const allFiles = await findAllFiles(join(__dirname, '../../../../../packages/social-feed/media'), '')
  
  // ✏ TODO:
  // FIGURE OUT HOW TO SOLVE ISSUES WITH URL SPECIAL CHARACTERS IN STATIC PATHS
  return allFiles.filter(path => path.indexOf("315x250%23c") === -1).map(path => {
    return { 
      params: {
        path
      }
    }
  })
}

/**
 * @param {import('astro').APIContext} context 
 */
export async function GET(context) {
  const { path } = context.params
  const realpath = join(__dirname, '../../../../../packages/social-feed/media', path || '')
  const mimeType = (await fileTypeFromFile(realpath))?.mime.toString() || 'application/octet-stream'
  
  const bytes = await readFile(realpath)
  return new Response(bytes, {
    headers: {
      'Content-Type': mimeType
    }
  })
}
