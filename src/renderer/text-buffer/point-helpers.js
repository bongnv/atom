/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const Point = require('./point');

exports.compare = function (a, b) {
  if (a.row === b.row) {
    return compareNumbers(a.column, b.column);
  } else {
    return compareNumbers(a.row, b.row);
  }
};

var compareNumbers = function (a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
};

exports.isEqual = (a, b) => a.row === b.row && a.column === b.column;

exports.traverse = function (start, distance) {
  if (distance.row === 0) {
    return new Point(start.row, start.column + distance.column);
  } else {
    return new Point(start.row + distance.row, distance.column);
  }
};

exports.traversal = function (end, start) {
  if (end.row === start.row) {
    return new Point(0, end.column - start.column);
  } else {
    return new Point(end.row - start.row, end.column);
  }
};

const NEWLINE_REG_EXP = /\n/g;

exports.characterIndexForPoint = function (text, point) {
  let { row } = point;
  const { column } = point;
  NEWLINE_REG_EXP.lastIndex = 0;
  while (row-- > 0) {
    if (!NEWLINE_REG_EXP.exec(text)) {
      return text.length;
    }
  }

  return NEWLINE_REG_EXP.lastIndex + column;
};

exports.clipNegativePoint = function (point) {
  if (point.row < 0) {
    return new Point(0, 0);
  } else if (point.column < 0) {
    return new Point(point.row, 0);
  } else {
    return point;
  }
};

exports.max = function (a, b) {
  if (exports.compare(a, b) >= 0) {
    return a;
  } else {
    return b;
  }
};

exports.min = function (a, b) {
  if (exports.compare(a, b) <= 0) {
    return a;
  } else {
    return b;
  }
};
