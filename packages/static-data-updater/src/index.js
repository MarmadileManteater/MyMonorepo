
// @ts-check

import { sanitizeTitle, unhotlinkImages, update } from './projects.js'
import { fromJSONFile } from '@marmadilemanteater/dataservice/projects'
import { rm } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

/** @type {'update-projects'|'unhotlink-images'|'clean-images'|null} */
let action = null
let accessToken = null
let debug = false
let dryRun = false
for (const arg of process.argv) {
  if (arg === 'update-projects' || arg == 'unhotlink-images' || arg === 'clean-images') {
    action = arg
  }
  if (arg.startsWith('--access-token=')) {
    accessToken = arg.substring('--access-token='.length)
  }
  if (arg === '--debug') {
    debug = true
  }
  if (arg === '--dry-run') {
    dryRun = true
  }
}

/** @type {import('./projects.js').EnvironmentConfig|null} */
let environmentConfig = null
if (accessToken !== null) {
  environmentConfig = {
    token: accessToken
  }
}

// generate cjs dirname from esm syntax
const __dirname = dirname(fileURLToPath(import.meta.url))
const { getAllProjects, writeAllProjects } = fromJSONFile(`${__dirname}/../../static-data/projects.json`)

if (action === 'update-projects') {
  const projects = await getAllProjects()
  const updatedProjects = await update(projects, environmentConfig || undefined, debug)
  if (!dryRun) {
    await writeAllProjects(updatedProjects)
  } else {
    console.log('Concluding dry run. No files actually modified.')
  }
}

if (action === 'unhotlink-images') {
  const projects = await getAllProjects()
  await unhotlinkImages(projects, join(__dirname, '../../static-data/public/images/thumbnails'), 170, debug)
}

if (action === 'clean-images') {
  const projects = await getAllProjects()
  for (const project of projects) {
    const fullPath = join(__dirname, '../../static-data/public/images/thumbnails', `${sanitizeTitle(project.title)}.webp`)
    await rm(fullPath)
  }
}

if (action === null) {
  console.log('Usage: static-data-updater {action} --access-token={personal-access-token} {--debug} {--dry-run}')
  console.log('Actions:')
  console.log('  📡 update-projects  - Updates projects in the `projects.json` file based on the Github API')
  console.log('  🧊 unhotlink-images - Downloads and resizes project thumbnails for web')
  console.log('  🧹 clean-images     - Removes all images created by `unhotlink-images`')
}
