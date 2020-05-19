---
date: '2015-12-17'
title: Using Cloudfront as a Rails CDN
tags: [Ruby, Devops]
description: This guide will walk you through using Amazon CloudFront as an asset CDN for your Rails app
book: articles
---

<Figure cover>
<img src='covers/rdLERs3ZGgQ.jpg' alt='Unrelated photo of a globe' />
</Figure>

Setting up a CDN for your application assets is not too difficult nowadays. This guide will walk you through using Amazon CloudFront as an asset CDN for your Rails application.

There are other guides out there today; [Heroku's CloudFront guide](https://devcenter.heroku.com/articles/using-amazon-cloudfront-cdn) is pretty good, but I think misses a few key points about CORS and denying requests outside `/assets`. This guide should fill those in.

## Set up CloudFront

Sign up in [aws.amazon.com](http://aws.amazon.com) and create a new CloudFront distribution. This will get you a subdomain (like `d1h2t3n5.cloudfront.net`) that will act as a caching proxy to your actual site. You may opt to use your own domain names if you like.

<!-- TODO: <ExternalLink href='https://aws.amazon.com' title='Amazon Web Services (AWS)' domain='aws.amazon.com' /> -->

### Custom configuration

Make sure that `OPTIONS` is also being passed through. This will allow CORS requests through (see next section). Also, enable "compress automatically" to let CloudFront handle gzip compression for you.

<Figure bordered>

**Origin Settings**

- Origin domain name: `www.yoursite.com`

</Figure>

<Figure bordered>

**Default Cache Behavior Settings**

- Allowed HTTP Methods: `GET, HEAD, OPTIONS`
- Cached HTTP Methods: Turn on `OPTIONS`
- Compress Objects Automatically: `on`

</Figure>

## Set up asset host

This will make `image_tag`, `asset_url` and other asset-related helpers point your assets to your CloudFront distribution. Do this only for `production.rb`.

<Figure code title='config/environments/production.rb'>

```rb
config.action_controller.asset_host = '<YOUR DISTRIBUTION SUBDOMAIN>.cloudfront.net'
```

</Figure>

## Serve static assets

Enable the serving of static assets. You will want to do this if you're using Heroku or any 12-factor-style deployment.
If you use a reverse proxy like Nginx or Haproxy, skip this section and configure your reverse proxy to handle CORS instead.

<Figure code title='config/environments/production.rb'>

```rb
# Rails 5+
config.public_file_server.enabled = true
config.public_file_server.headers = {
  'Cache-Control' => 'public, max-age=31536000'
}
```

</Figure>

<Figure code title='config/environments/production.rb'>

```rb
# Rails 4.x and below
config.serve_static_assets = true
config.static_cache_control = 'public, max-age=31536000'
```

</Figure>

## Enable CORS in assets

If you use `serve_static_assets`, you will need to enable cross-origin requests for assets. This will prevent issues like Firefox not loading custom icons and fonts.

### Install the `rack-cors` gem

Use the [rack-cors] gem to enable cross-origin requests. At time of writing, it is at version 0.4.0.

[rack-cors]: https://rubygems.org/gems/rack-cors

<Figure code title='Gemfile'>

```rb
gem 'rack-cors'
```

</Figure>

### Configure rack-cors

This will make assets accessible from any website. You want to enable this because you'd want `yoursite.com` to be able to load assets out of `<id>.cloudfront.net`.

<Figure code title='config/initializers/cors.rb'>

```rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'

    resource '/assets/*',
      headers: :any,
      methods: [:get]
  end
end

# In older versions of Rails, you'll need to use
# 'Rack::Cors' (as a string with quotes)
```

</Figure>

## Deny everything but /assets

Set up your app to disallow Cloudfront from fetching anything but `/assets`. This uses User Agent detection; see CloudFront's docs on [User-Agent headers](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorCustomOrigin.html#request-custom-user-agent-header) for information.

<Figure code title='app/services/cloudfront_denier.rb'>

```rb
# Middleware to deny CloudFront requests to non-assets
# http://ricostacruz.com/til/rails-and-cloudfront
class CloudfrontDenier
  def initialize(app, options = {})
    @app = app
    @target = options[:target] || '/'
  end

  def call(env)
    if cloudfront?(env) && !asset?(env)
      [302, { 'Location' => @target }, []]
    else
      @app.call(env)
    end
  end

  def asset?(env)
    env['PATH_INFO'] =~ %r{^/assets}
  end

  def cloudfront?(env)
    env['HTTP_USER_AGENT'] == 'Amazon CloudFront'
  end
end
```

</Figure>

<Figure code title='config/initializers/cloudfront.rb'>

```rb
Rails.application.config.middleware.use CloudfrontDenier,
  target: 'https://www.yoursite.com/'
```

</Figure>

If you miss this step, you'll be able to access the rest of your site in your CloudFront URL. While those aren't public, you'd best have them secured as it can open up security flaws and possibly lead to SEO penalties.
