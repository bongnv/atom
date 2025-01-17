// Converts a query string parameter for a line or column number
// to a zero-based line or column number for the Atom API.
function getLineColNumber(numStr) {
  const num = parseInt(numStr || 0, 10);
  return Math.max(num - 1, 0);
}

function openFile(atom, { query }) {
  const { filename, line, column } = query;

  atom.workspace.open(filename, {
    initialLine: getLineColNumber(line),
    initialColumn: getLineColNumber(column),
    searchAllPanes: true,
  });
}

const ROUTER = {
  '/open/file': { handler: openFile },
};

module.exports = {
  create(atomEnv) {
    return function coreURIHandler(parsed) {
      const config = ROUTER[parsed.pathname];
      if (config) {
        config.handler(atomEnv, parsed);
      }
    };
  },
};
