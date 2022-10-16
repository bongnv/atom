const externals = [
    "season",
    "snippets",
    "spelling-manager",
    "superstring",
    "tree-sitter",
    "nslog",
    "@atom/source-map-support",
    "archive-view",
    "image-view",
    "autocomplete-plus",
    "atom-select-list",
    "autosave",
    "background-tips",
    "bracket-matcher",
    "command-palette",
    "encoding-selector",
    "fuzzy-finder",
    "keybinding-resolver",
    "markdown-preview",
    "open-on-github",
    "package-generator",
    "scrollbar-style",
    "github",
    "settings-view",
    "spell-check",
    "styleguide",
    "symbols-view",
    "tabs",
    "timecop",
    "tree-view",
    "whitespace",
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
];

const webpackExternals = {};

for (let i = 0; i < externals.length; i++) {
    webpackExternals[externals[i]] = "commonjs " + externals[i]
}

module.exports = {
    externals,
    webpackExternals,
}