/*
* Request handlers
*
*/

// Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define handlers
const handlers = {}

// Sample handler
handlers.sample = function (data, callback) {
  // Callback a http status code and a payload object
  callback(406, { name: 'sample handler' })
}

handlers.ping = function (data, callback) {
  callback(200)
}

handlers.users = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  console.log(acceptableMethods.indexOf(data.method))
  if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {
    handlers._users[data.method.toLowerCase()](data, callback)
  } else {
    callback(405)
  }
}

// Container for the users submethods
handlers._users = {}

// Users post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: nonw
handlers._users.post = function (data, callback) {
  // Check that all required are complete
  const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
  const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false
  console.log(typeof(tosAgreement))

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesnt already exist
    _data.read('users', phone, function(err, data) {
      if (err) {
        // Hash password
        const hashedPassword = helpers.hash(password)
        if (hashedPassword) {
          // Create user object
        const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true
          }
          // Store the user
          _data.create('users', phone, userObject, function(err) {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { error: 'Could not create the new user' })
            }
          })    
        } else {
          callback(500, { error: 'Error hashing user password' })
        }
        
      } else {
        // User already exists
        callback(400, { error: 'A user with that phone number already exists' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields' })
  }
}

// Users get
// Required data: phone
// Optional data: none

handlers._users.get = function (data, callback) {
  // Chekc that phone number provided is valid
  const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false
  if (phone) {
    // Get the token from the headers
    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false
    // Verify that the given token is valid fot the phone number
    handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
      if (tokenIsValid) {
        // Lookup user
        _data.read('users', phone, function(err, data) {
          if (!err && data) {
          // Remove hashed password from user object before returning to user
          delete data.hashedPassword
          callback(200, data)
          } else {
          callback(404)
        }
      })
      } else {
        callback(403, { error: 'Missing required token in header or token is invalid' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field' })
  }
}

// Users put
// Required data: phone
// Optional data: firstNAme, lastName, password (At least one much be specified)
handlers._users.put = function (data, callback) {
  // Check for required field
  const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
  // Check for optional field
  const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
  const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
  const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  // Error if phone is invalid
  if (phone) {
    // Error if nothing is sent to updata
    if (firstName || lastName || password) {
      // Get the token from the headers
     const token = typeof(data.headers.token) === 'string' ? data.headers.token : false
     // Verify that the given token is valid for the phone number
     handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
        if (tokenIsValid) {
          // Lookup user
      _data.read('users', phone, function(err, userData) {
        if (!err && userData) {
          // Update necessary fields
          if (firstName) {
            userData.firstName = firstName
          }
          if (lastName) {
            userData.lastName = lastName
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password)
          }
          // Store new updated
          _data.update('users', phone, userData, function(err) {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { error: 'Could not update the user' })
            }
          })
        } else {
          callback(400, { error: 'The specified user does not exist' })
        }
      })
        } else {
        callback(403, { error: 'Missing required token in header or token is invalid' })
       }
     })
    }
  } else {
    callback(400, { error: 'Missing required field' })
  }
}

// Users delete
// Required field: phone
// @TODO - Cleanup (delete) any other data associated with this user
handlers._users.delete = function (data, callback) {
  // Chekc that phone number provided is valid
  const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false
  if (phone) {
    // Get the token from the headers
    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
      if (tokenIsValid) {
        // Lookup user
    _data.read('users', phone, function(err, data) {
      if (!err && data) {
        _data.delete('users', phone, function(err) {
          if (!err) {
            callback(200)
          } else {
            callback(500, { error: 'Could not delete the specified user' })
          }
        })
      } else {
        callback(400, { error: 'Could not find the specified user' })
      }
    })
      } else {
        callback(403, { error: 'Missing required token in header or token is invalid' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field' })
  }

}

// Tokens
handlers.tokens = function (data, callback) {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  console.log(acceptableMethods.indexOf(data.method))
  if (acceptableMethods.indexOf(data.method.toLowerCase()) > -1) {
    handlers._tokens[data.method.toLowerCase()](data, callback)
  } else {
    callback(405)
  }
}

// Container for all the tokens methods
handlers._tokens = {}

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
  const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false
  const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  if (phone && password) {
    // Lookup the user who matches that phone number
    _data.read('users', phone, function(err, userData) {
      if (!err && userData) {
        // Hash sent password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password)
        if (hashedPassword === userData.hashedPassword) {
          // If valid create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20)
          const expires = Date.now() + 1000 * 60 * 60
          const tokenObject = {
            phone,
            id: tokenId,
            expires
          }
          // Store the token
          _data.create('tokens', tokenId, tokenObject, function(err) {
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, { error: 'Could not create the new token' })
            }
          })
        } else {
          callback(400, { error: 'Password did not match the specified user\'s stored password' })
        }
      } else {
        callback(400, { error: 'Could not find the specified user' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fields' })
  }
}

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
  // Check that the id is valid
  const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false
  if (id) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400, { error: 'Missing required field' })
  }

}

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
  const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false
  const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? data.payload.extend : false
  if (id && extend === true) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure the token isnt already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60
          // Store the new updates
          _data.update('tokens', id, tokenData, function(err) {
            if (!err) {
              callback(200)
            } else {
              callback(500, { error: 'Could not update the token expiration' })
            }
          })
        } else {
          callback(400, { error: 'The token has already expired and cant be extended' })
        }
      } else {
        callback(400, { error: 'Specified token does not exist' })
      }
    })
  } else {
    callback(400, { error: 'Missing required field(s) or fields are invalid' })
  }
}

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function (data, callback) {
  // Check that the id is valid
  const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false
  if (id) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        _data.delete('tokens', id, function(err) {
          if (!err) {
            callback(200)
          } else {
            callback(500, { error: 'Could not delete specified token' })
          }
        })
      } else {
        callback(400, { error: 'Could not find the specified token' })
      }
    })
  } else {
    callback(400, { error: 'Missing required fiele' })
  }
}

// Verigfy if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
  // Lookup the token
  _data.read('tokens', id, function(err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the goven user and has not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

// Not found handler
handlers.notFound = function (data, callback) {
  callback(404)
}

// ES6
// // Handlers
// const handlers = {}
// // Sample route
// handlers.sample = (data) => {
//   // callback(406, { name: 'sample handler' })
//   return new Promise((resolve, reject) => {
//     resolve({ name: 'sample handler', status: 406 })
//   })
// }

// // Ping route
// handlers.ping = (data) => {
//   return new Promise((resolve, reject) => {
//     resolve({ status: 200 })
//   })
// }

// // Not found route
// handlers.notFound = (data) => {
//   return new Promise((resolve, reject) => {
//     resolve({ name: 'Not Found', status: 404 })
//   })
// }

// Export handlers
module.exports = handlers
