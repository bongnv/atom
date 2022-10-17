const externals = [
    "fs-admin", // main
    "fuzzy-finder", // it has task handler script
    "season",
    "spelling-manager",
    "superstring",
    "tree-sitter",
    "nslog",
    "@atom/source-map-support",
    "atom-select-list",
    "scrollbar-style",
    "spdx-correct",
    "spdx-license-ids",
    "spdx-expression-parse",
    "pathwatcher", // native
    "keyboard-layout", // native
    "oniguruma", // native
    "nsfw", // native
    "git-utils", // native
    "source-map",
    "browserslist",
    "coffeescript",
    "coffee-script",
    "less-cache", // main process
    "underscore", // TODO: look into fixing this
    "dugite", // git :)
    "semver", // no idea
];

const webpackExternals = {};

for (let i = 0; i < externals.length; i++) {
    webpackExternals[externals[i]] = "commonjs " + externals[i]
}

module.exports = {
    externals,
    webpackExternals,
}