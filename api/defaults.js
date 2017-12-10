
function defaults(options, def) {
  options = options || {}

  Object.keys(def).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      // No need to do clone since we mostly deal with
      // flat objects
      options[key] = def[key]
    }
    else if (typeof options[key] === 'object' &&
             typeof def[key] === 'object') {
      options[key] = defaults(options[key], def[key])
    }
  })

  return options
}

export default defaults
