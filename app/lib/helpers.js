/*
* Helperes for various tasks
*
*/

// Dependencies
const crypto = require('crypto')
const config = require('./config')

// Container for all the helpers
const helpers = {}

// Hash password helper - create a SHA256 hash
helpers.hash = function (str) {
  if (typeof(str) === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false
  }
}

// Parse a json string to an object in all cases without throwing
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str)
    return obj
  } catch (err) {
    return {}
  }
}

// Function that creates a string of random alphanumeric characters of a given length
helpers.createRandomString = function (strLength) {
  strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false
  if (strLength) {
    // Define all the possible charavcters that can go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    // Start the final string
    let str = ''
    for (let i = 1; i <= strLength; i++) {
      // Get a random character from the possible characters string
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      // Append this character to the final string
      str += randomCharacter
    }
    // Return the final string
    return str
  } else {
    return false
  }
}

// Export container
module.exports = helpers
