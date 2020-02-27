const Vinyl = require('vinyl')
const Stream = require('stream')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const { beforeEach, afterEach, it } = require('kocha')

require('ejs')
require('pug')
require('nunjucks')

const layout1 = require('../')

const helloHtmlVinyl = () => new Vinyl({
  path: 'hello.html',
  contents: Buffer.from('<p>Hello</p>')
})

const helloHtmlString = '<html><body><p>Hello</p></body></html>\n'

let tmpDir

beforeEach(() => {
  tmpDir = tmp.dirSync()
  fs.writeFileSync(path.join(tmpDir.name, 'layout.ejs'), '<html><body><%- file.contents %></body></html>\n', 'utf-8')
  fs.writeFileSync(path.join(tmpDir.name, 'layout.njk'), '<html><body>{{ file.contents | safe }}</body></html>\n', 'utf-8')
  fs.writeFileSync(path.join(tmpDir.name, 'layout.pug'), 'html\n  body !{file.contents}\n\n', 'utf-8')
  fs.writeFileSync(path.join(tmpDir.name, 'data.ejs'), '<html><title><%= title %></title><body><%- file.contents %></body></html>\n', 'utf-8')
})

afterEach(() => {
  tmpDir.removeCallback()
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
  layout1(path.join(tmpDir.name, 'layout.ejs'), { engine: 'ejs' })
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)

      done()
    })
    .write(helloHtmlVinyl())
})

it('wraps the file with the returned filename of the given layout function', done => {
  layout1(() => path.join(tmpDir.name, 'layout.ejs'), { engine: 'ejs' })
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)

      done()
    })
    .write(helloHtmlVinyl())
})

it('has alias methods .ejs(), .nunjucks(), .pug(), .hogan() etc', done => {
  let count = 0

  layout1.ejs(path.join(tmpDir.name, 'layout.ejs'))
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  layout1.nunjucks(path.join(tmpDir.name, 'layout.njk'))
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  layout1.pug(path.join(tmpDir.name, 'layout.pug'))
    .on('data', file => {
      expect(`${file.contents}\n`).to.equal(helloHtmlString)
      count++
    })
    .write(helloHtmlVinyl())

  setTimeout(() => {
    expect(count).to.equal(3)
    done()
  }, 1000)
})

it('options.data is passed as template variable', done => {
  layout1.ejs(path.join(tmpDir.name, 'data.ejs'), { data: { title: 'THE SITE' } })
    .on('data', file => {
      expect(`${file.contents}`).to.equal('<html><title>THE SITE</title><body><p>Hello</p></body></html>\n')

      done()
    })
    .write(helloHtmlVinyl())
})

it('uses cached layout template if the mtimes are the same', done => {
  // This test case increases the branch coverage of the cache hit check
  let c = 0

  const transform = layout1.ejs(path.join(tmpDir.name, 'layout.ejs'))
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
  layout1.ejs(path.join(tmpDir.name, 'layout.ejs'))
    .on('data', file => {
      expect(`${file.contents}`).to.equal(helloHtmlString)

      // This `setTimeout` is necessary to make sure the mtime is strictly
      // higher than the previous one.
      setTimeout(() => {
        fs.writeFileSync(path.join(tmpDir.name, 'layout.ejs'), '<html></html>')

        layout1.ejs(path.join(tmpDir.name, 'layout.ejs'))
          .on('data', file => {
            expect(`${file.contents}`).to.equal('<html></html>')

            done()
          })
          .write(helloHtmlVinyl())
      }, 10)
    })
    .write(helloHtmlVinyl())
})
