---
date: '2015-06-22'
title: Bundle your gems inside your project
description: Here's a tip to get the most out of your Ruby development experience.
tags: [Ruby]
---

When working on a Ruby project, I always put the files in `vendor/bundle/`. This has the benefit of having a greppable index of all the gems of your project, while keeping your global gemset tidy.

```bash
bundle install -j3 --path=vendor/bundle
```

<!-- {.-wide} -->

You only need to do this once in your project. The `--path` setting will be persisted in your project's Bundler configuration (`.bundle/config`).

<next-block title="Why would we want to do this?"></next-block>

## Inspecting your gems

Doing this will make inspecting your gem code easier. This can be conveniently done with something like ack or [the silver searcher]:

```bash
$ cd vendor/bundle/ruby/*/gems
$ ag all_application_helpers

  actionpack-4.2.1/lib/action_controller/metal/helpers.rb
  106:   def all_application_helpers
```

<next-block title="How do we ignore this from all repos?"></next-block>

## Globally ignoring

I recommend placing `vendor/bundle/` on a global gitignore. If you haven't set up a global gitignore list yet, it's pretty easy.

```bash
git config --global core.excludesfile ~/.gitignore
echo vendor/bundle >> ~/.gitignore
```

## Goodbye, rvm!

This removes the need for managing gemsets via [rvm]. In fact, if your project always uses the latest Ruby (which you also should, in my opinion!), you won't even need rvm at all.

Even if you don't use this tip, you actually don't need rvm gemsets at all. Bundler solves the same problem.

<next-block title="Bonus: let's speed up our installations!"></next-block>

## Parallel installs

Bonus: the `-j3` flag makes your installations faster by allowing 3 installs in parallel.

[rvm]: http://rvm.io/
[the silver searcher]: https://github.com/ggreer/the_silver_searcher