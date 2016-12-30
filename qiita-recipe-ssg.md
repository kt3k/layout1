layout1 + gulp-front-matter + gulp-marked を使って gulp で静的サイトを構築する

この記事では、[layout1][layout1], [gulp-front-matter][gulp-front-matter], [gulp-marked][gulp-marked] を使って、[gulp][gulp] 環境 (もしくは [bulbo][bulbo] 環境) で静的サイトジェネレータ的なビルドパイプラインを設定する方法を紹介します。(主に markdown から html を生成する部分の紹介です。)

# :dart: 目標とするビルド

目標とするビルドパイプラインは以下のような構成と仮定します。

- `source/` 以下に markdown ファイルがツリー状に配置されている。

```:markdownファイル配置例
source/
├── blog
│   ├── 2016
│   │   └── 01-01.md
│   └── 2017
│       └── 01-01.md
├── index.md
└── about.md
```
- `source/layout/` 以下に layout テンプレートが複数配置されている

```:レイアウトテンプレート配置例
source/layout/
├── default.ejs
└── post.ejs
```

- テンプレートエンジンは例として ejs とします。(簡単に切り替え可能)

- 以上の前提の上で、markdown ファイルをディレクトリー構造を保ちつつ、html に変換して、build ファイル以下にビルドするとします。

```:ビルド結果例
build/
├── blog
│   ├── 2016
│   │   └── 01-01.html
│   └── 2017
│       └── 01-01.html
├── index.html
└── about.html
```

- 各 markdown ファイルは YAML フロントマターを持っており、その中の layout プロパティで、どのレイアウトテンプレートでレンダリングされるかを選択可能

例えば、下のような markdown ファイルの場合

```md
---
layout: post
---
# Happy New Year 2016
```

`layout` プロパティの値が `post` なので、`source/layout/post.ejs` が使われる。もし、`layout` が `default` だった場合は、`source/layout/default.ejs` を使ってレンダリングされるという具合です。(layout が空だった場合は、`default.ejs` になるとします。)

長くなってしまいましたが、上のようなビルドをする場合の、設定の仕方を以下で紹介します。

# :wrench: 設定

npm で依存をインストール

    npm install gulp gulp-marked gulp-front-matter layout1 ejs --save-dev

もしくは yarn でインストール

    yarn add gulp gulp-marked gulp-front-matter layout1 ejs --dev
    

gulpfile.js の中で以下のように記述します。

```js:gulpfile.js
const gulp = require('gulp')
const frontMatter = require('gulp-front-matter')
const marked = require('gulp-marked')
const layout1 = require('layout1')

gulp.task('pages', () => (
  gulp.src('source/**/*.md')
    .pipe(frontMatter({ property: 'data' })) 
    .pipe(marked())
    .pipe(layout1.ejs(file => `source/layout/${file.data.layout || 'default'}.ejs`))
    .pipe(gulp.dest('build'))
))
```

gulp.task と gulp.src は説明不要と思います。

`.pipe(frontMatter({ property: 'data' }))` で YAML フロントマターをパースして、ファイルの data プロパティーにパース後のデータをセットしています。

`.pipe(marked())` で markdown を html に変換しています。

```
.pipe(layout1.ejs(file => `source/layout/${file.data.layout || 'default'}.ejs`))
```

という記述で、まずレイアウトエンジンとして、`ejs` を使う事を宣言しています。`source/layout/${file.data.layout || 'default'}.ejs` という記述で、レイアウトテンプレートは、フロントマターの layout プロパティを使って、source/layout/(layoutプロパティ値).ejs を使う事を設定しています。そして、`|| 'default'` という記述で、もし layout プロパティがなければ、`default.ejs` を使うという宣言になっています。

以上の設定をした上で、

    ./node_modules/.bin/gulp pages
    
を実行すると、目的のディレクトリツリーが build 以下に構築されていることが確認できます。

[デモレポジトリ][demo]

## [bulbo][bulbo] で設定する場合

[bulbo][bulbo] を使って同じ設定をすると次のようになります。

```js:bulbofile.js
const bulbo = require('bulbo')
const asset = bulbo.asset
const frontMatter = require('gulp-front-matter')
const marked = require('gulp-marked')
const layout1 = require('layout1')

asset('source/**/*.md')
  .pipe(frontMatter({ property: 'data' }))
  .pipe(marked())
  .pipe(layout1.ejs(file => `source/layout/${file.data.layout || 'default'}.ejs`))
```

# :octocat: [デモレポジトリ][demo]

上の設定をしたデモレポジトリです。(gulp & bulbo)

- https://github.com/kt3k/example-layout1-ssg

[gulp]: https://gulpjs.org/
[bulbo]: https://github.com/kt3k/bulbo
[layout1]: https://github.com/kt3k/layout1
[gulp-front-matter]: https://npm.im/gulp-front-matter
[gulp-marked]: https://npm.im/gulp-marked
[demo]: https://github.com/kt3k/example-layout1-ssg
