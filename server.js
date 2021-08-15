/*
* Primary file for api
*
*/

// Dependencies
const http = require('http')
const url = require('url')

// Server should respond to all requests with a string
// const server = http.createServer(function (req, res) {
//   // Get url and parse it
//   const parsedUrl = url.parse(req.url, true)
//   // Get the path from the url
//   const path = parsedUrl.pathname
//   // Trim the path
//   const trimmedPath = path.replace(/^\/+|\/+$/g, '')
//   // send the response
//   res.end('Hello World\n')
//   // log the path
//   console.log('Request recieved on path: ' + trimmedPath)
// })

// // Start the server and have it listen on port 3000
// server.listen(3000, function () {
//   console.log('The server is listening on port 3000')
// })

// ES6
// Server should respond to all requests with a string
const server = http.createServer((req, res) => {
  // parse url
  const parsedUrl = url.parse(req.url, true)
  // Get the path
  const path = parsedUrl.pathname
  // Trim the path
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')
  // send response
  res.end('Hello World\n')
  // log path
  console.log(`Request recieved on path: ${trimmedPath}`)
})

// Start the server and have it listen on port 3000
server.listen(3000, () => {
  console.log('The server is listening on port 3000')
})
