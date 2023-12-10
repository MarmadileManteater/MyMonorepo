

export function streamToString(stream) {
  return new Promise((resolve, _reject) => {
    let output = []
    stream.on('data', (data) => {
      output.push(data.toString())
    })
    stream.on('end', (code) => {
      resolve(output.join('\r\n'))
    })
  })
}
