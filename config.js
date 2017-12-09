'use strict'

const nconf = require('nconf')

// Helper method for global usage.
nconf.inTest = () => nconf.get('NODE_ENV') === 'test'

// Config follow the following priority check order:
// 1. package.json
// 2. Enviroment variables
// 3. config/config.json
// 4. config/config.default.json


// Load package.json for name and such
let pckg = require('./package.json')

pckg = {
  name: pckg.name,
  version: pckg.version,
  description: pckg.description,
  author: pckg.author,
  license: pckg.license,
  homepage: pckg.homepage,
}


// Load overrides as first priority
nconf.overrides(pckg)


// Load enviroment variables as second priority
nconf.env()


// Load any overrides from the appropriate config file
let configFile = 'config/config.json'

/* istanbul ignore else */
if (nconf.get('NODE_ENV') === 'test') {
  configFile = 'config/config.test.json'
}

/* istanbul ignore if */
if (nconf.get('NODE_ENV') === 'production') {
  configFile = 'config/config.production.json'
}

nconf.file('main', configFile)

// Load defaults
nconf.file('default', 'config/config.default.json')


// Final sanity checks
/* istanbul ignore if */
if (typeof global.it === 'function' & !nconf.inTest()) {
  // eslint-disable-next-line no-console
  console.log('Critical: potentially running test on production enviroment. Shutting down.')
  process.exit(1)
}


module.exports = nconf
