const consolidate = require('consolidate')

module.exports = Object.keys(consolidate).filter(x => typeof consolidate[x].render === 'function')
