/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let Injections;
const _ = require('underscore-plus');

const Scanner = require('./scanner');
const ScopeSelector = require('./scope-selector');

module.exports = Injections = class Injections {
  constructor(grammar, injections = {}) {
    this.grammar = grammar;
    this.injections = [];
    this.scanners = {};
    for (var selector in injections) {
      var values = injections[selector];
      if (
        __guard__(
          values != null ? values.patterns : undefined,
          (x) => x.length
        ) <= 0
      ) {
        continue;
      }
      var patterns = [];
      for (var regex of values.patterns) {
        var pattern = this.grammar.createPattern(regex);
        patterns.push(...pattern.getIncludedPatterns(this.grammar, patterns));
      }
      this.injections.push({
        selector: new ScopeSelector(selector),
        patterns,
      });
    }
  }

  getScanner(injection) {
    if (injection.scanner != null) {
      return injection.scanner;
    }

    const scanner = new Scanner(injection.patterns);
    injection.scanner = scanner;
    return scanner;
  }

  getScanners(ruleStack) {
    if (this.injections.length === 0) {
      return [];
    }

    const scanners = [];
    const scopes = this.grammar.scopesFromStack(ruleStack);
    for (var injection of this.injections) {
      if (injection.selector.matches(scopes)) {
        var scanner = this.getScanner(injection);
        scanners.push(scanner);
      }
    }
    return scanners;
  }
};

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined;
}
