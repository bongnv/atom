let parser;
try {
  parser = require('./snippet-body');
} catch (error) {
  const { allowUnsafeEval } = require('loophole');
  const PEG = require('pegjs');

  const grammarSrc = require('./snippet-body.pegjs?raw');
  parser = null;
  allowUnsafeEval(() => (parser = PEG.buildParser(grammarSrc)));
}

module.exports = parser;
