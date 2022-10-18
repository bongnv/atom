module.exports = {
    sourceMaps: "inline",
    presets: [
      ["@babel/preset-env", {
        targets: {electron: process.versions.electron || process.env.ELECTRON_VERSION || "12.2.3"}
      }],
      "@babel/preset-react"
    ]
  }
