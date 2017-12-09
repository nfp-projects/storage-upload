
export default function defaults(options, defaults) {
  options = options || {}

  Object.keys(defaults).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      // No need to do clone since we mostly deal with
      // flat objects
      options[key] = defaults[key]
    }
  })

  return options
}
