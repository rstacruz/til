---
date: '2015-05-29'
title: Testing generated static sites
tags: [Development, Jekyll]
description: Ever feel guilty that your Jekyll sites don't have tests? Here's a way around that.
book: archive
---

You can make a test script use `grep` and `test` to check for generated output. Since grep will die with an error code if it doesn't match anything, the test will be considered a failure.

<Figure code title='test.sh'>

```bash
#!/usr/bin/env sh
set -o errexit # die on errors

grep "<title>" _site/index.html >/dev/null
grep display _site/style.css >/dev/null
grep function _site/script.js >/dev/null
test -f _site/image.jpg # check for file existence
```

</Figure>

### Travis support

You can even integrate these with your [Travis-CI] tests. (Learn more about build configuration from their [documentation](http://docs.travis-ci.com/user/build-configuration/).)

<Figure code title='.travis.yml'>

```yaml
before_script: bundle exec jekyll build
script: ./test/test.sh
```

</Figure>

### Makefiles

Another good way is to use a `Makefile` so you can simply use `make test` to invoke tests.

<Figure code title='Makefile'>

```bash
test: _site
    grep display _site/style.css >/dev/null
    grep function _site/script.js >/dev/null
    test -f _site/image.jpg #check for file existence

_site:
    bundle
    bundle exec jekyll build --safe
```

</Figure>

[travis-ci]: http://travis-ci.org
