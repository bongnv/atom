// Determine the Electron accelerator for a given Atom keystroke.
//
// keystroke - The keystroke.
//
// Returns a String containing the keystroke in a format that can be interpreted
//   by Electron to provide nice icons where available.
function acceleratorForKeystroke(keystroke) {
  if (!keystroke) {
    return null;
  }
  let modifiers = keystroke.split(/-(?=.)/);
  const key = modifiers
    .pop()
    .toUpperCase()
    .replace('+', 'Plus');

  modifiers = modifiers.map(modifier =>
    modifier
      .replace(/shift/gi, 'Shift')
      .replace(/cmd/gi, 'Command')
      .replace(/ctrl/gi, 'Ctrl')
      .replace(/alt/gi, 'Alt')
  );

  const keys = [...modifiers, key];
  return keys.join('+');
}

module.exports = {
  acceleratorForKeystroke,
};
