/*
* Primary file for api
*
*/

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./app/lib/config')
const fs = require('fs')
const _data = require('./app/lib/data')
const handlers = require('./app/lib/handlers')
const helpers = require('./app/lib/helpers')

// TESTING
// _data.create('test', 'newFile', { foo: 'bar' }, function(err) {
//   console.log('this was the error', err)
// })
// _data.read('test', 'newFile', function(err, data) {
//   console.log('this was the error', err)
//   console.log('This was the data', data)
// })
// _data.update('test', 'newFile', { fizz: 'buzz' }, function(err) {
//   console.log('this was the error', err)
// })
// _data.update('test', 'newFile', { fizz: 'buzz' })
// .then(response => {
//   console.log(response)
// })
// .catch(err => {
//   console.log(err)
// })

// _data.delete('test', 'newFile', function(err) {
//   console.log('this was the error', err)
// })
// _data.delete('test', 'newFile')
// .then(response => {
//   console.log(response)
// })
// .catch(err => {
//   console.log(err)
// })

// Instantiate http server
const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
})

// Start the http server
httpServer.listen(config.httpPort, function () {
  console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`)
})

// Instantiate https server
httpsServerOptions = {
  key: fs.readFileSync('./app/https/key.pem'),
  cert: fs.readFileSync('./app/https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res)
})

// Start https server
httpsServer.listen(config.httpsPort, function () {
  console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`)
})

// All the erver logic for both http and https server
const unifiedServer = function (req, res) {
  // Get url and parse it
  const parsedUrl = url.parse(req.url, true)
  // Get the path from the url
  const path = parsedUrl.pathname
  // Trim the path
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')
  // Get the query string as an object
  const queryStringObject = parsedUrl.query
  // Get the http method
  const method = req.method.toUpperCase()
  // Get headers as an objject
  const headers = req.headers
  // Get the payload, if there is any
  const decoder = new StringDecoder('utf-8')
  // Create buffer
  let buffer = ''
  // listen for data event and add data stream to buffer
  req.on('data', function (data) {
    buffer += decoder.write(data)
  })
  // Listen for end event
  req.on('end', function () {
    // Add to stream
    buffer += decoder.end()
    // Choose handler request should go to, if one is not found use not found handler
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
    // Construct data object to send to handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the handler
    chosenHandler(data, function (statusCode, payload) {
      // Use the staus code called back by the handler or default to 200
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200
      // Use the payload called back by the handler or default to and empty object
      payload = typeof (payload) === 'object' ? payload : {}
      // Convert the payload to a string
      const payloadString = JSON.stringify(payload)
      // send the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // log the path
      console.log('Returning this response: ', statusCode, payloadString)
    })
  })
}

// Define a request router
const router = {
  sample: handlers.sample,
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens
}

// ES6
// Instantiate http server
// const httpServer = http.createServer((req, res) => {
//   unifiedServer(req, res)
// })

// // Start the http server
// httpServer.listen(config.httpPort, () => {
//   console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`)
// })

// // Instantiate https server
// const httpsServerOptions = {
//   key: fs.readFileSync('./app/https/key.pem'),
//   cert: fs.readFileSync('./app/https/cert.pem')
// }
// const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
//   unifiedServer(req, res)
// })

// // Start the https server
// httpsServer.listen(config.httpsPort, () => {
//   console.log(`The server is listening on port ${config.httpsPort} in ${config.envName} mode`)
// })

// const unifiedServer = async (req, res) => {
//   // parse url
//   const parsedUrl = url.parse(req.url, true)
//   // Get the path
//   const path = parsedUrl.pathname
//   // Trim the path
//   const trimmedPath = path.replace(/^\/+|\/+$/g, '')
//   // Get query string in object
//   const queryStringObject = parsedUrl.query
//   // Get method
//   const method = req.method.toUpperCase()
//   // Get headers as an object
//   const headers = req.headers
//   // Get payload if there is one
//   const decoder = new StringDecoder('utf-8')
//   // Create buffer
//   let buffer = ''
//   // listen for data and append to buffer
//   req.on('data', (data) => {
//     buffer += decoder.write(data)
//   })
//   // listen for end of stream, append data and then deal with response
//   req.on('end', async () => {
//     buffer += decoder.end()
//     // Match with request with handler
//     const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
//     // Construct data object
//     const data = {
//       trimmedPath: trimmedPath,
//       queryStringObject: queryStringObject,
//       method: method,
//       headers: headers,
//       payload: buffer
//     }

//     // chosenHandler(data)
//     // .then(response => {
//     //   console.log('Returning this response: ', response.status, response.name)
//     //   res.writeHead(response.status)
//     //   res.end(JSON.stringify(response))
//     // })
//     // .catch(err => console.log(err))
//     try {
//       const response = await chosenHandler(data)
//       if (response) {
//         console.log('Returning this response: ', response.status, response.name)
//         res.setHeader('Content-Type', 'application/json')
//         res.writeHead(response.status)
//         res.end(JSON.stringify(response))
//       }
//     } catch (err) {
//       console.log(err)
//     }
//   })
// }

// // Router
// const router = {
//   sample: handlers.sample,
//   ping: handlers.ping
// }
