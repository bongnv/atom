const path = require("path");

module.exports = {
  sourceMaps: "inline",
  plugins: [
    "babel-plugin-relay",
    path.join(__dirname, "./assert-messages-plugin.js"),
    "@atom/babel-plugin-chai-assert-async",
    "@babel/plugin-proposal-class-properties",

    // Needed for esprima
    "@babel/plugin-proposal-object-rest-spread",
  ],
  presets: [
    ["@babel/preset-env", {
      targets: {electron: process.versions.electron || process.env.ELECTRON_VERSION || "12.2.3"}
    }],
    "@babel/preset-react"
  ],
  env: {
    coverage: {
      plugins: ["babel-plugin-istanbul"]
    }
  }
}
