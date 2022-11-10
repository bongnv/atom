const { ScopeSelector } = require('atom');
const cache = {};

exports.get = function (selector) {
  let scopeSelector = cache[selector];
  if (!scopeSelector) {
    scopeSelector = new ScopeSelector(selector);
    cache[selector] = scopeSelector;
  }
  return scopeSelector;
};
