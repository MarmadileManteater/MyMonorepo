
// @ts-check

import { readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parseString } from 'xml2js'
import { promisify } from 'util'

const pparseString = promisify(parseString)

const __dirname = dirname(fileURLToPath(new URL(import.meta.url)))

/**
 * @typedef Media
 * @property {string} mimeType
 * @property {'image'|'video'} medium 🖼`image` or 🎥`video`
 * @property {string} url 🔗
 * @property {string} alt
 */

/**
 * @typedef SocialPost
 * @property {string} title
 * @property {string} originalUrl
 * @property {string} handle
 * @property {string} authorUrl
 * @property {string} platformUrl
 * @property {string} description 
 * @property {string} content
 * @property {number} date
 * @property {Media[]} media
 */

/**
 * 
 * @param {number} startRange 
 * @param {number} endRange
 * @returns {Promise<SocialPost[]>}
 */
export async function getSocialPosts(startRange, endRange = -1) {
  const rssFeedString = (await readFile(join(__dirname, '../../social-feed/feed.xml'))).toString()
  const xmldom = await pparseString(rssFeedString)
  const channel = xmldom.channel[0]
  if (endRange === -1) {
    endRange = channel.item.length
  }
  return channel.item
    .slice(startRange, endRange)
    .map(item => {
      const title = item.title[0]
      const originalUrl = item.link[0]
      const authorUrl = item.author[0].uri[0]
      const handle = item.author[0].name[0]
      const platformUrl = `https://${new URL(authorUrl).hostname}`
      const description = item.description[0]
      const content = item['content:encoded'][0]
      const date = new Date(item.pubDate[0]).getTime()
      /** @type {Media[]} */
      const media = item['media:content'].filter(content => content !== undefined).map(content => {
        const mimeType = content.$?.type
        const medium = content.$?.medium
        const url = content.$?.url
        const alt = Object.keys(content).indexOf('media:description') !== -1 ? content["media:description"][0] : ''
        /** @type {Media} */
        return {
          mimeType,
          medium,
          url,
          alt
        }
      })
      /** @type {SocialPost} */
      return {
        title,
        originalUrl,
        handle,
        authorUrl,
        platformUrl,
        description,
        content,
        date,
        media
      }
    })
}
