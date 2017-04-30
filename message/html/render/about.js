const nest = require('depnest')
const extend = require('xtend')
const ref = require('ssb-ref')
const { h, when } = require('mutant')

exports.gives = nest('message.html.render')

exports.needs = nest({
  'about.html.link': 'first',
  'blob.sync.url': 'first',
  'message.html': {
    decorate: 'reduce',
    layout: 'first'
  }
})

exports.create = function (api) {
  return nest('message.html.render', about)

  function about (msg, opts) {
    if (msg.value.content.type !== 'about') return

    const element = api.message.html.layout(msg, extend({
      content: renderContent(msg),
      layout: 'default'
    }, opts))

    return api.message.html.decorate(element, { msg })
  }

  function renderContent (msg) {
    const { author, content } = msg.value
    var { about, link, name, description, image } = content

    // TODO : build better normalizers
    if (image && ref.isBlob(image.link)) image = image.link
    about = about || link

    if (!ref.isFeed(about)) {
      return [
        'Describes ',
        h('a', { href: about }, [about.slice(0, 7), '...']),
        ' as: ',
        name
      ]
    }

    const target = author === about
      ? 'themself '
      : api.about.html.link(about)

    return [
      'Declares the following about ', target,
      when(name, h('div', [ h('strong', 'Name: '), name ])),
      when(description, h('div', [ h('strong', 'Description: '), description ])),
      when(image, h('img', { src: api.blob.sync.url(image) }))
    ]
  }
}

