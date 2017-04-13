'use strict'

const Vinyl = require('vinyl')
const Stream = require('stream')
const mock = require('mock-fs')
const expect = require('chai').expect
const fs = require('fs')

require('ejs')
require('pug')
require('nunjucks')
require('handlebars')
require('mustache')

const layout1 = require('../')

const helloHtmlVinyl = () => new Vinyl({
  path: 'hello.html',
  contents: new Buffer('<p>Hello</p>')
})

const helloHtmlString = '<html><body><p>Hello</p></body></html>\n'

beforeEach(() => {
  mock({
    '/fixture': {
      'layout.ejs': '<html><body><%- file.contents %></body></html>\n',
      'layout.njk': '<html><body>{{ file.contents | safe }}</body></html>\n',
      'layout.pug': 'html\n  body !{file.contents}\n\n',
      'layout.hbs': '<html><body>{{{ file.contents }}}</body></html>\n',
      'layout.mustache': '<html><body>{{{ file.contents }}}</body></html>\n',
      'data.ejs': '<html><title><%= title %></title><body><%- file.contents %></body></html>\n'
    }
  })
})

afterEach(() => {
  mock.restore()
})

it('returns a stream', () => {
  expect(layout1('test.ejs', { engine: 'ejs' })).to.be.instanceof(Stream)
})

it('throws an error when the layout param is not a string or a function', () => {
  expect(() => layout1(undefined, { engine: 'ejs' })).to.throw()
  expect(() => layout1(null, { engine: 'ejs' })).to.throw()
  expect(() => layout1([], { engine: 'ejs' })).to.throw()
  expect(() => layout1({}, { engine: 'ejs' })).to.throw()
})

it('throws an error when the engine option is not given', () => {
  expect(() => layout1('test.ejs')).to.throw()
  expect(() => layout1('test.ejs', {})).to.throw()
})

it('it throws an error when the given engine name is invalid', () => {
  expect(() => layout1('test.ejs', { engine: 'erb' })).to.throw()
})

it('wraps the file with the given template filename', done => {
  layout1('/fixture/layout.ejs', { engine: 'ejs' })
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)

      done()
    })
    .write(helloHtmlVinyl())
})

it('wraps the file with the returned filename of the given layout function', done => {
  layout1(() => '/fixture/layout.ejs', { engine: 'ejs' })
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)

      done()
    })
    .write(helloHtmlVinyl())
})

it('has alias methods .ejs(), .nunjucks(), .pug(), .handlebars(), .mustache(), .hogan() etc', done => {
  let count = 0

  layout1.ejs('/fixture/layout.ejs')
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  layout1.nunjucks('/fixture/layout.njk')
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  layout1.pug('/fixture/layout.pug')
    .on('data', file => {
      expect(`${file.contents}\n`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  layout1.handlebars('/fixture/layout.hbs')
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  layout1.mustache('/fixture/layout.mustache')
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  setTimeout(() => {
    expect(count).to.equal(5)
    done()
  }, 1000)
})

it('options.data is passed as template variable', done => {
  layout1.ejs('/fixture/data.ejs', { data: { title: 'THE SITE' } })
    .on('data', file => {
      expect(`${file.contents}`).to.equal('<html><title>THE SITE</title><body><p>Hello</p></body></html>\n')

      done()
    })
    .write(helloHtmlVinyl())
})

it('uses cached layout template if the mtimes are the same', done => {
  // This test case increases the branch coverage of the cache hit check
  let c = 0

  const transform = layout1.ejs('/fixture/layout.ejs')
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)

      c += 1

      if (c == 2) {
        done()
      }
    })

  transform.write(helloHtmlVinyl())
  transform.write(helloHtmlVinyl())
})

it('reloads the layout file if it is updated', done => {
  layout1.ejs('/fixture/layout.ejs')
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)

      fs.writeFileSync('/fixture/layout.ejs', '<html></html>')

      layout1.ejs('/fixture/layout.ejs')
        .on('data', file => {
          expect(`${file.contents}`).to.equal('<html></html>')

          done()
        })
       .write(helloHtmlVinyl())
    })
    .write(helloHtmlVinyl())
})
