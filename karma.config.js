module.exports = function(config) {
  config.set({
    frameworks: ["mocha", "chai", "chai-as-promised", "sinon-chai"],
    client: {
      mocha: {}
    },
    files: [
      "test/browser-integration/**.js",
      "dist/saga.bundle.min.js"
    ],
    browsers: [
      "Chrome",
      "SlimerJS",
      "PhantomJS"
    ]
  })
}
