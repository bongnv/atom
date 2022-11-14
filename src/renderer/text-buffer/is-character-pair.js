/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
module.exports = function (character1, character2) {
  const charCodeA = character1.charCodeAt(0);
  const charCodeB = character2.charCodeAt(0);
  return (
    isSurrogatePair(charCodeA, charCodeB) ||
    isVariationSequence(charCodeA, charCodeB) ||
    isCombinedCharacter(charCodeA, charCodeB)
  );
};

var isCombinedCharacter = (charCodeA, charCodeB) =>
  !isCombiningCharacter(charCodeA) && isCombiningCharacter(charCodeB);

var isSurrogatePair = (charCodeA, charCodeB) =>
  isHighSurrogate(charCodeA) && isLowSurrogate(charCodeB);

var isVariationSequence = (charCodeA, charCodeB) =>
  !isVariationSelector(charCodeA) && isVariationSelector(charCodeB);

var isHighSurrogate = (charCode) => 0xd800 <= charCode && charCode <= 0xdbff;

var isLowSurrogate = (charCode) => 0xdc00 <= charCode && charCode <= 0xdfff;

var isVariationSelector = (charCode) =>
  0xfe00 <= charCode && charCode <= 0xfe0f;

var isCombiningCharacter = (charCode) =>
  (0x0300 <= charCode && charCode <= 0x036f) ||
  (0x1ab0 <= charCode && charCode <= 0x1aff) ||
  (0x1dc0 <= charCode && charCode <= 0x1dff) ||
  (0x20d0 <= charCode && charCode <= 0x20ff) ||
  (0xfe20 <= charCode && charCode <= 0xfe2f);
