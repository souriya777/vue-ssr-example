const Vue = require('vue')

module.exports = function createApp(context) {
  return new Vue({
    data: {
      url: context.url,
      random: Math.random()
    },
    template: `<div>⭐️ URL: {{ url }} random: {{ random }}</div>`
  })
}