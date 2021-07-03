import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Nconf from 'nconf-lite'

const nconf = new Nconf()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
let pckg = JSON.parse(fs.readFileSync(path.resolve(path.join(__dirname, '../package.json'))))


// Helper method for global usage.
nconf.inTest = () => nconf.get('NODE_ENV') === 'test'

// Config follow the following priority check order:
// 1. package.json
// 2. Enviroment variables
// 3. config/config.json
// 4. config/config.default.json


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
let configFile = '../config/config.json'

/* istanbul ignore else */
if (nconf.get('NODE_ENV') === 'test') {
  configFile = '../config/config.test.json'
}

/* istanbul ignore if */
if (nconf.get('NODE_ENV') === 'production') {
  configFile = '../config/config.production.json'
}

nconf.file('main', path.resolve(path.join(__dirname, configFile)))

// Load defaults
nconf.file('default', path.resolve(path.join(__dirname, '../config/config.default.json')))


// Final sanity checks
/* istanbul ignore if */
if (typeof global.it === 'function' & !nconf.inTest()) {
  // eslint-disable-next-line no-console
  console.log('Critical: potentially running test on production enviroment. Shutting down.')
  process.exit(1)
}


export default nconf
