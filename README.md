# layout1 - v1.1.0

> Gulp transform which `wraps` the files in the stream with the given layout template(s).

<img width="100" src="https://kt3k.github.io/layout1/media/l1.svg" />

[![CircleCI](https://circleci.com/gh/kt3k/layout1.svg?style=svg)](https://circleci.com/gh/kt3k/layout1)
[![Build status](https://ci.appveyor.com/api/projects/status/q1pko428feasdcgh?svg=true)](https://ci.appveyor.com/project/kt3k/layout1)
[![codecov](https://codecov.io/gh/kt3k/layout1/branch/master/graph/badge.svg)](https://codecov.io/gh/kt3k/layout1)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# :green_heart: Features

- gulp plugin (gulpfriendly)
- wraps files in any template files (ejs, nunjucks, pug, handlebars, mustache, hogan, etc)
- able to select template files per file (like `jekyll` or `middleman`)

# Usage

Install via npm:

    npm install layout1 --save-dev

or via yarn:

    yarn add layout1 --dev

Then require it in gulpfile.js:

```js
const gulp = require('gulp')
const layout1 = require('layout1')
```

Then use it in your gulp pipeline,

```js
gulp.task('pages', () => (
  gulp.src('source/*.html')
    .pipe(layout1.ejs('source/layout/page.ejs'))
    .pipe(gulp.dest('build'))
))
```

In the above example you specified `source/layout/page.ejs` as the only template file (in `ejs` syntax). So all the files in the stream are wrapped by `source/layout/page.ejs`.

**NOTE**: When you use ejs as template engine, you also need to install `ejs` as the peer dependency.

    npm install ejs --save-dev

## What does `wrap` mean in this case?

For example, suppose `source/layout/page.ejs` is like the following:

```ejs
<!doctype>
<html>
  <title><%= file.relative %></title>
  <body>
    <%= file.contents %>
  </body>
</html>
```

And suppose a file in the stream, called `hello.html`, is like the following:

```html
<p>hello</p>
```

Then the result of the above pipeline transform of `hello.html` is like the following:

```html
<!doctype>
<html>
  <title>hello.html</title>
  <body>
    <p>hello</p>
  </body>
</html>
```

So `hello.html` is wrapped by layout file `source/layout/page.ejs`.

## Use with other engines

When you use with `nunjucks`, you need to install `nunjucks` as a peer dependency:

    npm install nunjucks --save-dev

And create the pipeline like the following:

```js
gulp.task('pages', () => (
  gulp.src('source/*.html')
    .pipe(layout1.nunjucks('source/layout/page.njk'))
    .pipe(gulp.dest('build'))
))
```

If you want to use `handlebars` engine, then it's similar:

    npm install handlebars --save-dev

And call `layout1.handlebars`:

```js
gulp.task('pages', () => (
  gulp.src('source/*.html')
    .pipe(layout1.handlebars('source/layout/page.hbs'))
    .pipe(gulp.dest('build'))
))
```

If you want to use `pug`, `mustache`, `hogan` etc, then it's similar as the above.

## Select different layout template per file

Like `jekyll`, `middleman` or any other popular static site generators do, it's useful if you can change layout template file depending on file.

In `layout1`, you can change the layout template file passing a function as the first param of `layout1`.

```js
gulp.task('site', () => (
  gulp.src('source/**/*.md')
    .pipe(marked())
    .pipe(layout1.ejs(file => (
      /^article/.test(file.relative) ? 'source/layout/article.ejs' : 'source/layout/page.ejs'
    )))
    .pipe(gulp.dest('build'))
))
```

In the above example, the file is wrapped by `source/layout/article.ejs` if the path includes `article` at the start like `source/article/2016-10-10.md`, otherwise it's wrapped by `source/layout/page.ejs`.

## :pizza: Recipe: Select layout template file according to the file's YAML front-matter

This example is much more similar to static site generators. By passing the function as the first param to `layout1`, you can select layout template file according to YAML front-matter, although this plugin itself doesn't know about what front-matter is.

First you need to parse YAML front-matter by `gulp-front-matter`:

```js
const frontMatter = require('gulp-front-matter')
```

Then you need to transform markdown to html by `gulp-marked`:

```js
const marked = require('gulp-marked')
```

Finally, you can select the layout template file according to YAML front-matter's, for example, `layout` property:

```js
gulp.task('site', () => (
  gulp.src('source/**/*.md')
    .pipe(frontMatter({ property: 'data' })
    .pipe(marked())
    .pipe(layout1.ejs(
      file => `source/layout/${file.data.layout || 'default'}.ejs`
     ))
    .pipe(gulp.dest('build'))
))
```

In the above example, `layout1` selects the template file according to YAML front-matter's `layout` property. For example, if the front-matter is like:

```md
---
layout: page
...
---
```

Then this file is wrapped by `source/layout/page.ejs` and if the front-matter is like:

```md
---
layout: article
...
---
```

Then this file is wrapped by `source/layout/article.ejs`.

In addition to the above, if the front-matter doesn't have `layout` property, then the file is wrapped by `sourde/layout/default.ejs`.

This is quite similar to layout selection mechanism of `jekyll` and `middleman`.

## :dango: Recipe: Pass variables to the layout template

By passing `data` option, you can set template variables from gulpfile.

```js
gulp.task('pages', () => (
  gulp.src('source/*.html')
    .pipe(layout1.ejs('layout.ejs', { data: { siteName: 'My Home' } }))
    .pipe(gulp.dest('build'))
))
```

And you have following `layout.ejs` and `source/hello.html`:

```ejs
<title><%= siteName %></title><body><%- file.contents %></body>
```

```html
<p>Hello</p>
```

Then you get `build/hello.html` like the following:

```html
<title>My Home</title><body><p>Hello</p></body>
```

# API reference

The API is really simple. It has basically the only one function `layout1` (except alias methods). It returns a gulp transform as described above. It has some options.

```js
const layout1 = require('layout1')
```

## layout1(layout, options)

- @param {string|function} layout

If `layout` is a string, then it's used as the only template filename.
If `layout` is a function, then it's called with the `file` (vinyl) object and the returned value (this should be a string) is considered as the template filename.

- @param {object} options
- @param {string} options.engine

The template engine to use. You can also specify this by using alias methods for the engines.

- @param {object} options.data

The additional template variables passed to the wrapping template.

## Alias methods

As the examples above show, this plugin has the alias methods for selecting template engines.

### layout1.ejs(layout, options)
### layout1.nunjucks(layout, options)
### layout1.handlebars(layout, options)
### layout1.pug(layout, options)
### layout1.mustache(layout, options)
### layout1.hogan(layout, options)

All these are the same as `layout1(layout, options)` except that `options.engine` is set to the given one.

**NOTE** The all list of avaialable template engines are:

```
liquid
jade
dust
swig
atpl
liquor
twig
ejs
eco
jazz
jqtpl
haml
hamlet
whiskers
haml-coffee
hogan
templayed
handlebars
underscore
lodash
pug
qejs
walrus
mustache
just
ect
mote
toffee
dot
bracket
ractive
nunjucks
htmling
react
arc-templates
vash
slm
marko
```

# Example project

The example of usage of layout1 in a gulp and [bulbo][bulbo] project.

- https://github.com/kt3k/example-layout1-ssg

# :globe_with_meridians: Similar project

These library do the similar thing in a different APIs.

- [gulp-wrap][gulp-wrap]
- [layou-wrapper][layout-wrapper]

# :credit_card: License

MIT

# :notebook: History

- 2017-04-13   v1.1.0   Improve template cache handling.
- 2016-12-29   v1.0.1   Add logo.
- 2016-12-26   v1.0.0   Initial release

[bulbo]: https://github.com/kt3k/bulbo
[gulp-wrap]: https://www.npmjs.com/package/gulp-wrap
[layout-wrapper]: https://www.npmjs.com/package/layout-wrapper
