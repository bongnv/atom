const externals = [
    "season",
    "spelling-manager",
    "spellchecker", // native
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
    "fswin", // main
    "fs-admin", // main
    "underscore", // TODO: look into fixing this
    "keytar", // native
    "dugite", // git :)
    "semver",
    "what-the-status", // can't transpiled via babel
    "fuzzy-finder", // it has task handler script
];

const webpackExternals = {};

for (let i = 0; i < externals.length; i++) {
    webpackExternals[externals[i]] = "commonjs " + externals[i]
}

module.exports = {
    externals,
    webpackExternals,
}