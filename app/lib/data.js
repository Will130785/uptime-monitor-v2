/*
* Library for storing and editing data
*
*/

// Dependencies
const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

// Container for module (to be exported)
const lib = {}

// Base directory of data folder
lib.baseDir = path.join(__dirname, '../.data/')

// Write data to file
lib.create = function (dir, file, data, callback) {
  // Open file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data)
      // Write to file and close
      fs.writeFile(fileDescriptor, stringData, function (err) {
        if (!err) {
          fs.close(fileDescriptor, function (err) {
            if (!err) {
              callback(false)
            } else {
              callback('Error closing new file')
            }
          })
        } else {
          callback('Error writing to new file')
        }
      })
    } else {
      callback('Could not create new file, it may already exist')
    }
  })
}

// Read data from a file
lib.read = function (dir, file, callback) {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', function(err, data) {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data)
      callback(false, parsedData)
    } else {
      callback(err, data)
    }
  })
}

// Update existing data inside a file
lib.update = function (dir, file, data, callback) {
  // Open the file
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data)
      // Truncate contents of file
      fs.truncate(fileDescriptor, function(err){
        if (!err) {
          // Write to file and close
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err){
                if (!err) {
                  callback(false)
                } else {
                  callback('Error closing file')
                }
              })
            } else {
              callback('Error writing to existing file')
            }
          })
        } else {
          callback('Error truncating file')
        }
      })
    } else {
      callback('Error opening file for updating, it may not exist yet')
    }
  })
}

// Delete file
lib.delete = function(dir, file, callback) {
  // Unlink the file
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err){
    if (!err) {
      callback(false)
    } else {
      callback('There was an error deleting the file')
    }
  })
  // ES6 - return promise rather than call back
//   return new Promise((resolve, reject) => {
//     fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err){
//       if (!err) {
//         resolve(false)
//       } else {
//         reject('There was an error deleting the file')
//       }
//     })
//   })
}

// Export module
module.exports = lib
