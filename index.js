const fs = require('fs')
const wrap = require('gulp-wrap')

const pkg = require('./package')
const engines = require('./engines')
const seeHomepage = `\nSee ${pkg.homepage}`

const layoutMemo = {}

/**
 * Gets the layout file as string. Uses memo.
 * @param {string} filename The filename
 * @return {string}
 */
const getLayout = filename => {
  if (!layoutMemo[filename]) {
    layoutMemo[filename] = fs.readFileSync(filename).toString()
  }

  return layoutMemo[filename]
}

/**
 * @param {string|Function} layout The layout filename or The function returning the layout filename. The funcion is called with the vinyl as the first param.
 * @param {string} options.engine The template engine name
 */
const layout1 = (layout, options) => {
  options = options || {}

  const engine = options.engine
  const templateData = options.data

  if (typeof layout !== 'string' && typeof layout !== 'function') {
    throw new Error(`\`layout\` param should be a string or fuction: ${typeof layout} is given${seeHomepage}`)
  }

  if (!engine) {
    throw new Error(`\`engine\` is not specified
\`engine\` should be one of ${engines}${seeHomepage}`)
  }

  if (engines.indexOf(engine) === -1) {
    throw new Error(`Unknown \`engine\`: ${engine}
\`engine\` should be one of ${engines}${seeHomepage}`)
  }

  return wrap(data => {
    if (typeof layout === 'string') {
      return getLayout(layout)
    } else if (typeof layout === 'function') {
      return getLayout(layout(data.file))
    }
  }, templateData, { engine })
}

module.exports = layout1

engines.forEach(engineName => {
  module.exports[engineName] = (layout, options) => {
    options = options || {}
    options.engine = engineName

    return layout1(layout, options)
  }
})
