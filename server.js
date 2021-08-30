/*
* Primary file for api
*
*/

// Dependencies
const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

// Server should respond to all requests with a string
// const server = http.createServer(function (req, res) {
//   // Get url and parse it
//   const parsedUrl = url.parse(req.url, true)
//   // Get the path from the url
//   const path = parsedUrl.pathname
//   // Trim the path
//   const trimmedPath = path.replace(/^\/+|\/+$/g, '')
//   // Get the query string as an object
//   const queryStringObject = parsedUrl.query
//   // Get the http method
//   const method = req.method.toUpperCase()
//   // Get headers as an objject
//   const headers = req.headers
//   // Get the payload, if there is any
//   const decoder = new StringDecoder('utf-8')
//   // Create buffer
//   let buffer = ''
//   // listen for data event and add data stream to buffer
//   req.on('data', function (data) {
//     buffer += decoder.write(data)
//   })
//   // Listen for end event
//   req.on('end', function () {
//     // Add to stream
//     buffer += decoder.end()
//     // Choose handler request should go to, if one is not found use not found handler
//     const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
//     // Construct data object to send to handler
//     const data = {
//       trimmedPath: trimmedPath,
//       queryStringObject: queryStringObject,
//       method: method,
//       headers: headers,
//       payload: buffer
//     }

//     // Route the request to the handler specified in the handler
//     chosenHandler(data, function (statusCode, payload) {
//       // Use the staus code called back by the handler or default to 200
//       statusCode = typeof (statusCode) === 'number' ? statusCode : 200
//       // Use the payload called back by the handler or default to and empty object
//       payload = typeof (payload) === 'object' ? payload : {}
//       // Convert the payload to a string
//       const payloadString = JSON.stringify(payload)
//       // send the response
//       res.writeHead(statusCode)
//       res.end(payloadString)

//       // log the path
//       console.log('Returning this response: ', statusCode, payloadString)
//     })
//   })
// })

// // Start the server and have it listen on port 3000
// server.listen(3000, function () {
//   console.log('The server is listening on port 3000')
// })

// // Define handlers
// const handlers = {}

// // Sample handler
// handlers.sample = function (data, callback) {
//   // Callback a http status code and a payload object
//   callback(406, { name: 'sample handler' })
// }

// // Not found handler
// handlers.notFound = function (data, callback) {
//   callback(404)
// }

// // Define a request router
// const router = {
//   sample: handlers.sample
// }

// ES6
// Server should respond to all requests with a string
const server = http.createServer((req, res) => {
  // parse url
  const parsedUrl = url.parse(req.url, true)
  // Get the path
  const path = parsedUrl.pathname
  // Trim the path
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')
  // Get query string in object
  const queryStringObject = parsedUrl.query
  // Get method
  const method = req.method.toUpperCase()
  // Get headers as an object
  const headers = req.headers
  // Get payload if there is one
  const decoder = new StringDecoder('utf-8')
  // Create buffer
  let buffer = ''
  // listen for data and append to buffer
  req.on('data', (data) => {
    buffer += decoder.write(data)
  })
  // listen for end of stream, append data and then deal with response
  req.on('end', () => {
    buffer += decoder.end()
    // Match with request with handler
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
    // Construct data object
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer
    }

    chosenHandler(data)
    .then(response => {
      console.log('Returning this response: ', response.status, response.name)
      res.writeHead(response.status)
      res.end(JSON.stringify(response))
    })
    .catch(err => console.log(err))
  })
})

// Start the server and have it listen on port 3000
server.listen(3000, () => {
  console.log('The server is listening on port 3000')
})

// Handlers
const handlers = {}
// Sample route
handlers.sample = (data) => {
  // callback(406, { name: 'sample handler' })
  return new Promise((resolve, reject) => {
    resolve({ name: 'sample handler', status: 406 })
  })
}
// Not found route
handlers.notFound = (data) => {
  return new Promise((resolve, reject) => {
    resolve({ name: 'Not Found', status: 404 })
  })
}
// Router
const router = {
  sample: handlers.sample
}
