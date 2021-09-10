/*
* Create and export config variables
*
*/
const { NODE_ENV } = process.env

const environments = {}

// Dev (default) environment
environments.development = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'development',
  hashingSecret: 'thisIsASecret'
}

// Production envirionment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAlsoASecret'
}

// Determine which env to export
const currentEnvironment = typeof(NODE_ENV) === 'string' ? NODE_ENV.toLowerCase() : ''
// Check that the current environment is one of the envs above
const envirionmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.development
// Export the module
module.exports = envirionmentToExport
