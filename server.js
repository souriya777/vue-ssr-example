const Vue = require('vue')
const server = require('express')()

const createApp = require('./factory')

const singletonInstance = new Vue({
  data: {
    randomNb: Math.random()
  },
  template: `<div>singleton random number: {{ randomNb }}</div>`
})

server.get('/with-template', (req, res) => {
  const myVueInstance = new Vue({
    data: {
      url: req.url
    },
    template: `<div>😎 WITH template {{ url }}</div>`
  })

  const renderer = require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./index.template.html', 'utf-8')
  })

  renderer.renderToString(myVueInstance, (_, html) => {
    res.end(html)
  })
})

server.get('/template-interpolation', (_, res) => {
  const subComponent = Vue.component('sub-component', {
    data: function() {
      return {
        subCount: 888
      }
    },
    template: `<div>my sub-count: {{ subCount }}</div>`
  })
  const app = new Vue({
    data: {
      count: 777,
      randomNb: Math.random()
    },
    components: { subComponent },
    template: `<div>
      my count: {{ count }} random {{ randomNb }}
      <sub-component />
    </div>`
  })

  const renderer = require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./template-interpolation.html', 'utf-8')
  })

  const context = {
    title: 'my beautiful title 🔥',
    meta: `
      <meta name="description" content="My description">
    `,
    msg: `Le bonheur n'est réel que s'il est partagé.`
  }

  renderer.renderToString(app, context, (_, html) => {
    res.end(html)
  })
})

server.get('/singleton-instance', (_, res) => {
  const renderer = require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./index.template.html', 'utf-8')
  })

  renderer.renderToString(singletonInstance, (_, html) => {
    res.end(html)
  })
})

server.get('/factory', (req, res) => {
  const context = { url: req.url }
  const app = createApp(context)

  const renderer = require('vue-server-renderer').createRenderer({
    template: require('fs').readFileSync('./index.template.html', 'utf-8')
  })
  renderer.renderToString(app, (_, html) => {
    res.end(html)
  })
})

server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>🙏 The visited URL is {{ url }}</div>`
  })

  const renderer = require('vue-server-renderer').createRenderer()

  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
    }
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
    `)
  })
})

server.listen(8080)