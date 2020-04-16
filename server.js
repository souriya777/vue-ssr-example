const Vue = require("vue")
const server = require("express")()

const SINGLETON_INSTANCE = new Vue({
  data: {
    randomNb: Math.random(),
  },
  template: `<div>"cached" random number: {{ randomNb }}</div>`,
})

server.get(['/', '/ssr-inline-html'], (req, res) => {
  const vm = new Vue({
    data: {
      url: req.url,
    },
    template: `<div>url: {{ url }}</div>`,
  })

  const renderer = require("vue-server-renderer").createRenderer()

  renderer.renderToString(vm, (_, html) => {
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
    `)
  })
})

server.get("/ssr-template-html", (_, res) => {
  const subComponent = Vue.component("sub-component", {
    data: function () {
      return {
        subCount: 222,
      }
    },
    template: `<div>my sub-count: {{ subCount }}</div>`,
  })
  const app = new Vue({
    data: {
      count: 111,
      randomNb: Math.random(),
    },
    components: { subComponent },
    template: `<div>
      my count: {{ count }} random {{ randomNb }}
      <sub-component />
    </div>`,
  })

  const renderer = require("vue-server-renderer").createRenderer({
    template: require("fs").readFileSync(
      "./template/template-interpolation.html",
      "utf-8"
    ),
  })

  const context = {
    title: "my beautiful title 🔥",
    meta: `
      <meta name="description" content="My description">
    `,
    msg: `Le bonheur n'est réel que s'il est partagé.`,
  }

  renderer.renderToString(app, context, (_, html) => {
    res.end(html)
  })
})

server.get("/ssr-with-cache", (_, res) => {
  const renderer = require("vue-server-renderer").createRenderer({
    template: require("fs").readFileSync("./template/index.html", "utf-8"),
  })

  renderer.renderToString(SINGLETON_INSTANCE, (_, html) => {
    res.end(html)
  })
})

console.log(`Listen on port 3000`)
server.listen(3000)
