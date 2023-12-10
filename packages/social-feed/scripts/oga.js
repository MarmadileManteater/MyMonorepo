
import DomParser from 'dom-parser'
import { streamToString } from './stream-to-string.js'
import { decode, encode } from 'html-entities'

const { parseFromString } = new DomParser()

let input = await streamToString(process.stdin)

var parsed = parseFromString(input)
parsed.getElementsByTagName("item").forEach(item => {
  const before_html = parseFromString(item.innerHTML).getElementsByTagName("description")[0].innerHTML
  let description_html = decode(before_html)
  const description = parseFromString(description_html)
  const anchors = description.getElementsByTagName("a").filter(a => a.attributes.filter(a => a.name === "download").length !== 0)
  for (var i = 0; i < anchors.length; i++) {
    var a = anchors[i]
    description_html = description_html.replace(a.outerHTML, `<img src="${a.getAttribute("href")}" alt="${a.innerHTML}" /> <br/> ${a.outerHTML}`)
  }
  const bad_images = description.getElementsByClassName("file-icon")
  bad_images.forEach(img => {
    description_html = description_html.replace(img.outerHTML.replace("/>", " />"), "")
  })
  input = input.replace(before_html, encode(description_html))
})
console.log(input)
