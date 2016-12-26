const test = require('tape')
const Vinyl = require('vinyl')

const layout1 = require('../')
const layoutEjs = `${__dirname}/fixture/layout.ejs`
const layoutNunjucks = `${__dirname}/fixture/layout.njk`
const layoutPug = `${__dirname}/fixture/layout.pug`
const layoutHandlebars = `${__dirname}/fixture/layout.hbs`
const layoutMustache = `${__dirname}/fixture/layout.mustache`

const helloHtmlVinyl = () => new Vinyl({
  path: 'hello.html',
  contents: new Buffer('<p>Hello</p>')
})

const helloHtmlString = '<html><body><p>Hello</p></body></html>\n'

test('it returns a stream', t => {
  t.plan(1)

  t.ok(typeof layout1('test.ejs', { engine: 'ejs' }).pipe === 'function')
})

test('it throws an error when the layout param is not a string or a function', t => {
  t.plan(4)

  t.throws(() => layout1(undefined, { engine: 'ejs' }))
  t.throws(() => layout1(null, { engine: 'ejs' }))
  t.throws(() => layout1([], { engine: 'ejs' }))
  t.throws(() => layout1({}, { engine: 'ejs' }))
})

test('it throws an error when the engine option is not given', t => {
  t.plan(2)

  t.throws(() => layout1('test.ejs'))
  t.throws(() => layout1('test.ejs', {}))
})

test('it throws an error when the given engine name is invalid', t => {
  t.plan(1)

  t.throws(() => layout1('test.ejs', { engine: 'erb' }))
})

test('wraps the file with the given template filename', t => {
  t.plan(1)

  layout1(layoutEjs, { engine: 'ejs' })
    .on('data', file => t.equal(`${file.contents}`, helloHtmlString))
    .write(helloHtmlVinyl())
})

test('wraps the file with the returned filename of the given layout function', t => {
  t.plan(1)

  layout1(() => layoutEjs, { engine: 'ejs' })
    .on('data', file => t.equal(`${file.contents}`, helloHtmlString))
    .write(helloHtmlVinyl())
})

test('it has alias methods .ejs(), .nunjucks(), .pug(), .handlebars(), .mustache(), .hogan() etc', t => {
  t.plan(5)

  layout1.ejs(layoutEjs)
    .on('data', file => t.equal(`${file.contents}`, helloHtmlString))
    .write(helloHtmlVinyl())

  layout1.nunjucks(layoutNunjucks)
    .on('data', file => t.equal(`${file.contents}`, helloHtmlString))
    .write(helloHtmlVinyl())

  layout1.pug(layoutPug)
    .on('data', file => t.equal(`${file.contents}\n`, helloHtmlString))
    .write(helloHtmlVinyl())

  layout1.handlebars(layoutHandlebars)
    .on('data', file => t.equal(`${file.contents}`, helloHtmlString))
    .write(helloHtmlVinyl())

  layout1.mustache(layoutMustache)
    .on('data', file => t.equal(`${file.contents}`, helloHtmlString))
    .write(helloHtmlVinyl())
})
