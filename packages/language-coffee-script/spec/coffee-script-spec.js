/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');

describe('CoffeeScript grammar', function () {
  let grammar = null;

  beforeEach(function () {
    waitsForPromise(() =>
      atom.packages.activatePackage('language-coffee-script')
    );

    return runs(
      () => (grammar = atom.grammars.grammarForScopeName('source.coffee'))
    );
  });

  it('parses the grammar', function () {
    expect(grammar).toBeTruthy();
    return expect(grammar.scopeName).toBe('source.coffee');
  });

  it('tokenizes classes', function () {
    let { tokens } = grammar.tokenizeLine('class Foo');

    expect(tokens[0]).toEqual({
      value: 'class',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'storage.type.class.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: 'Foo',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'entity.name.type.class.coffee',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('class_ Foo'));
    expect(tokens[0]).toEqual({
      value: 'class_',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'entity.name.function.coffee',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('_class Foo'));
    expect(tokens[0]).toEqual({
      value: '_class',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'entity.name.function.coffee',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('[class Foo]'));
    expect(tokens[0]).toEqual({
      value: '[',
      scopes: [
        'source.coffee',
        'punctuation.definition.array.begin.bracket.square.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: 'class',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'storage.type.class.coffee',
      ],
    });
    expect(tokens[2]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.coffee'],
    });
    expect(tokens[3]).toEqual({
      value: 'Foo',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'entity.name.type.class.coffee',
      ],
    });
    expect(tokens[4]).toEqual({
      value: ']',
      scopes: [
        'source.coffee',
        'punctuation.definition.array.end.bracket.square.coffee',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('bar(class Foo)'));
    expect(tokens[0]).toEqual({
      value: 'bar',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'entity.name.function.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: '(',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'meta.arguments.coffee',
        'punctuation.definition.arguments.begin.bracket.round.coffee',
      ],
    });
    expect(tokens[2]).toEqual({
      value: 'class',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'meta.arguments.coffee',
        'meta.class.coffee',
        'storage.type.class.coffee',
      ],
    });
    expect(tokens[3]).toEqual({
      value: ' ',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'meta.arguments.coffee',
        'meta.class.coffee',
      ],
    });
    expect(tokens[4]).toEqual({
      value: 'Foo',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'meta.arguments.coffee',
        'meta.class.coffee',
        'entity.name.type.class.coffee',
      ],
    });
    return expect(tokens[5]).toEqual({
      value: ')',
      scopes: [
        'source.coffee',
        'meta.function-call.coffee',
        'meta.arguments.coffee',
        'punctuation.definition.arguments.end.bracket.round.coffee',
      ],
    });
  });

  it('tokenizes named subclasses', function () {
    const { tokens } = grammar.tokenizeLine('class Foo extends Bar');

    expect(tokens[0]).toEqual({
      value: 'class',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'storage.type.class.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: 'Foo',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'entity.name.type.class.coffee',
      ],
    });
    expect(tokens[3]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.coffee'],
    });
    expect(tokens[4]).toEqual({
      value: 'extends',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'keyword.control.inheritance.coffee',
      ],
    });
    expect(tokens[5]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.coffee'],
    });
    return expect(tokens[6]).toEqual({
      value: 'Bar',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'entity.other.inherited-class.coffee',
      ],
    });
  });

  it('tokenizes anonymous subclasses', function () {
    const { tokens } = grammar.tokenizeLine('class extends Foo');

    expect(tokens[0]).toEqual({
      value: 'class',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'storage.type.class.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: 'extends',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'keyword.control.inheritance.coffee',
      ],
    });
    expect(tokens[3]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.coffee'],
    });
    return expect(tokens[4]).toEqual({
      value: 'Foo',
      scopes: [
        'source.coffee',
        'meta.class.coffee',
        'entity.other.inherited-class.coffee',
      ],
    });
  });

  it('tokenizes instantiated anonymous classes', function () {
    const { tokens } = grammar.tokenizeLine('new class');

    expect(tokens[0]).toEqual({
      value: 'new',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'keyword.operator.new.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.instance.constructor.coffee'],
    });
    return expect(tokens[2]).toEqual({
      value: 'class',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'storage.type.class.coffee',
      ],
    });
  });

  it('tokenizes instantiated named classes', function () {
    let { tokens } = grammar.tokenizeLine('new class Foo');

    expect(tokens[0]).toEqual({
      value: 'new',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'keyword.operator.new.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.instance.constructor.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: 'class',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'storage.type.class.coffee',
      ],
    });
    expect(tokens[3]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.instance.constructor.coffee'],
    });
    expect(tokens[4]).toEqual({
      value: 'Foo',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'entity.name.type.instance.coffee',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('new Foo'));

    expect(tokens[0]).toEqual({
      value: 'new',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'keyword.operator.new.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' ',
      scopes: ['source.coffee', 'meta.class.instance.constructor.coffee'],
    });
    return expect(tokens[2]).toEqual({
      value: 'Foo',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'entity.name.type.instance.coffee',
      ],
    });
  });

  it('tokenizes class names that start with `class` correctly', function () {
    const { tokens } = grammar.tokenizeLine('new classTest');

    expect(tokens[0]).toEqual({
      value: 'new',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'keyword.operator.new.coffee',
      ],
    });
    return expect(tokens[2]).toEqual({
      value: 'classTest',
      scopes: [
        'source.coffee',
        'meta.class.instance.constructor.coffee',
        'entity.name.type.instance.coffee',
      ],
    });
  });

  it('tokenizes comments', function () {
    let { tokens } = grammar.tokenizeLine('# I am a comment');

    expect(tokens[0]).toEqual({
      value: '#',
      scopes: [
        'source.coffee',
        'comment.line.number-sign.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' I am a comment',
      scopes: ['source.coffee', 'comment.line.number-sign.coffee'],
    });

    ({ tokens } = grammar.tokenizeLine('#{Comment}'));

    expect(tokens[0]).toEqual({
      value: '#',
      scopes: [
        'source.coffee',
        'comment.line.number-sign.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    return expect(tokens[1]).toEqual({
      value: '{Comment}',
      scopes: ['source.coffee', 'comment.line.number-sign.coffee'],
    });
  });

  it('tokenizes block comments', function () {
    const lines = grammar.tokenizeLines(`\
### I am a block comment
Very blocky
Until here
###\
`);
    expect(lines[0][0]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    expect(lines[0][1]).toEqual({
      value: ' I am a block comment',
      scopes: ['source.coffee', 'comment.block.coffee'],
    });
    expect(lines[2][0]).toEqual({
      value: 'Until here',
      scopes: ['source.coffee', 'comment.block.coffee'],
    });
    expect(lines[3][0]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });

    const { tokens } = grammar.tokenizeLine(
      'identity = ###::<T>### (value ###: T ###) ###: T ### ->'
    );
    expect(tokens[0]).toEqual({
      value: 'identity',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[4]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    expect(tokens[5]).toEqual({
      value: '::<T>',
      scopes: ['source.coffee', 'comment.block.coffee'],
    });
    expect(tokens[6]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    expect(tokens[9]).toEqual({ value: 'value ', scopes: ['source.coffee'] }); // TODO: These scopes are incorrect and should be fixed
    expect(tokens[10]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    expect(tokens[11]).toEqual({
      value: ': T ',
      scopes: ['source.coffee', 'comment.block.coffee'],
    });
    expect(tokens[12]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    expect(tokens[14]).toEqual({ value: ' ', scopes: ['source.coffee'] }); // TODO: These scopes are incorrect and should be fixed
    expect(tokens[15]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    expect(tokens[16]).toEqual({
      value: ': T ',
      scopes: ['source.coffee', 'comment.block.coffee'],
    });
    expect(tokens[17]).toEqual({
      value: '###',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'punctuation.definition.comment.coffee',
      ],
    });
    return expect(tokens[19]).toEqual({
      value: '->',
      scopes: [
        'source.coffee',
        'meta.function.inline.coffee',
        'storage.type.function.coffee',
      ],
    });
  });

  it('tokenizes annotations in block comments', function () {
    const lines = grammar.tokenizeLines(`\
###
  @foo - food
@bar - bart\
`);

    expect(lines[1][0]).toEqual({
      value: '  ',
      scopes: ['source.coffee', 'comment.block.coffee'],
    });
    expect(lines[1][1]).toEqual({
      value: '@foo',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'storage.type.annotation.coffee',
      ],
    });
    return expect(lines[2][0]).toEqual({
      value: '@bar',
      scopes: [
        'source.coffee',
        'comment.block.coffee',
        'storage.type.annotation.coffee',
      ],
    });
  });

  describe('numbers', function () {
    it('tokenizes hexadecimals', function () {
      let { tokens } = grammar.tokenizeLine('0x1D306');
      expect(tokens[0]).toEqual({
        value: '0x1D306',
        scopes: ['source.coffee', 'constant.numeric.hex.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('0X1D306'));
      return expect(tokens[0]).toEqual({
        value: '0X1D306',
        scopes: ['source.coffee', 'constant.numeric.hex.coffee'],
      });
    });

    it('tokenizes binary literals', function () {
      let { tokens } = grammar.tokenizeLine('0b011101110111010001100110');
      expect(tokens[0]).toEqual({
        value: '0b011101110111010001100110',
        scopes: ['source.coffee', 'constant.numeric.binary.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('0B011101110111010001100110'));
      return expect(tokens[0]).toEqual({
        value: '0B011101110111010001100110',
        scopes: ['source.coffee', 'constant.numeric.binary.coffee'],
      });
    });

    it('tokenizes octal literals', function () {
      let { tokens } = grammar.tokenizeLine('0o1411');
      expect(tokens[0]).toEqual({
        value: '0o1411',
        scopes: ['source.coffee', 'constant.numeric.octal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('0O1411'));
      expect(tokens[0]).toEqual({
        value: '0O1411',
        scopes: ['source.coffee', 'constant.numeric.octal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('0010'));
      return expect(tokens[0]).toEqual({
        value: '0010',
        scopes: ['source.coffee', 'constant.numeric.octal.coffee'],
      });
    });

    it('tokenizes decimals', function () {
      let { tokens } = grammar.tokenizeLine('1234');
      expect(tokens[0]).toEqual({
        value: '1234',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('5e-10'));
      expect(tokens[0]).toEqual({
        value: '5e-10',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('5E+5'));
      expect(tokens[0]).toEqual({
        value: '5E+5',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('9.'));
      expect(tokens[0]).toEqual({
        value: '9',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'constant.numeric.decimal.coffee',
          'punctuation.separator.decimal.period.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('.9'));
      expect(tokens[0]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'constant.numeric.decimal.coffee',
          'punctuation.separator.decimal.period.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '9',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('9.9'));
      expect(tokens[0]).toEqual({
        value: '9',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'constant.numeric.decimal.coffee',
          'punctuation.separator.decimal.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '9',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('.1e-23'));
      expect(tokens[0]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'constant.numeric.decimal.coffee',
          'punctuation.separator.decimal.period.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '1e-23',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('1.E3'));
      expect(tokens[0]).toEqual({
        value: '1',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'constant.numeric.decimal.coffee',
          'punctuation.separator.decimal.period.coffee',
        ],
      });
      return expect(tokens[2]).toEqual({
        value: 'E3',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
    });

    return it('does not tokenize numbers that are part of a variable', function () {
      let { tokens } = grammar.tokenizeLine('hi$1');
      expect(tokens[0]).toEqual({ value: 'hi$1', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine('hi_1'));
      return expect(tokens[0]).toEqual({
        value: 'hi_1',
        scopes: ['source.coffee'],
      });
    });
  });

  it('tokenizes variable assignments', function () {
    let { tokens } = grammar.tokenizeLine('something = b');
    expect(tokens[0]).toEqual({
      value: 'something',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '=',
      scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('something : b'));
    expect(tokens[0]).toEqual({
      value: 'something',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: ':',
      scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a and= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: 'and=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    // Should NOT be tokenized as and=
    ({ tokens } = grammar.tokenizeLine('operand=true'));
    expect(tokens[0]).toEqual({
      value: 'operand',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[1]).toEqual({
      value: '=',
      scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
    });

    ({ tokens } = grammar.tokenizeLine('a or= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: 'or=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    // Should NOT be tokenized as or=
    ({ tokens } = grammar.tokenizeLine('editor=false'));
    expect(tokens[0]).toEqual({
      value: 'editor',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[1]).toEqual({
      value: '=',
      scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
    });

    ({ tokens } = grammar.tokenizeLine('a -= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '-=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a += b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '+=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a /= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '/=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a &= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '&=',
      scopes: [
        'source.coffee',
        'keyword.operator.assignment.compound.bitwise.coffee',
      ],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a %= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '%=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a *= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '*=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a ?= b'));
    expect(tokens[0]).toEqual({
      value: 'a',
      scopes: ['source.coffee', 'variable.assignment.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '?=',
      scopes: ['source.coffee', 'keyword.operator.assignment.compound.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('a == b'));
    expect(tokens[0]).toEqual({ value: 'a ', scopes: ['source.coffee'] });
    expect(tokens[1]).toEqual({
      value: '==',
      scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
    });
    expect(tokens[2]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('false == b'));
    expect(tokens[0]).toEqual({
      value: 'false',
      scopes: ['source.coffee', 'constant.language.boolean.false.coffee'],
    });
    expect(tokens[1]).toEqual({ value: ' ', scopes: ['source.coffee'] });
    expect(tokens[2]).toEqual({
      value: '==',
      scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('true == b'));
    expect(tokens[0]).toEqual({
      value: 'true',
      scopes: ['source.coffee', 'constant.language.boolean.true.coffee'],
    });
    expect(tokens[1]).toEqual({ value: ' ', scopes: ['source.coffee'] });
    expect(tokens[2]).toEqual({
      value: '==',
      scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('null == b'));
    expect(tokens[0]).toEqual({
      value: 'null',
      scopes: ['source.coffee', 'constant.language.null.coffee'],
    });
    expect(tokens[1]).toEqual({ value: ' ', scopes: ['source.coffee'] });
    expect(tokens[2]).toEqual({
      value: '==',
      scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
    });
    expect(tokens[3]).toEqual({ value: ' b', scopes: ['source.coffee'] });

    ({ tokens } = grammar.tokenizeLine('this == b'));
    expect(tokens[0]).toEqual({
      value: 'this',
      scopes: ['source.coffee', 'variable.language.this.coffee'],
    });
    expect(tokens[1]).toEqual({ value: ' ', scopes: ['source.coffee'] });
    expect(tokens[2]).toEqual({
      value: '==',
      scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
    });
    return expect(tokens[3]).toEqual({
      value: ' b',
      scopes: ['source.coffee'],
    });
  });

  it('tokenizes compound operators properly', function () {
    let tokens;
    const assignmentOperators = [
      'and=',
      'or=',
      '&&=',
      '||=',
      '/=',
      '*=',
      '%=',
      '+=',
      '-=',
    ];
    const bitwiseOperators = ['<<=', '>>=', '>>>=', '&=', '|=', '^='];
    const comparisonOperators = ['==', '!=', '<=', '>='];

    for (var assignmentOperator of assignmentOperators) {
      ({ tokens } = grammar.tokenizeLine(assignmentOperator));
      expect(tokens[0]).toEqual({
        value: assignmentOperator,
        scopes: [
          'source.coffee',
          'keyword.operator.assignment.compound.coffee',
        ],
      });
    }

    for (var bitwiseOperator of bitwiseOperators) {
      ({ tokens } = grammar.tokenizeLine(bitwiseOperator));
      expect(tokens[0]).toEqual({
        value: bitwiseOperator,
        scopes: [
          'source.coffee',
          'keyword.operator.assignment.compound.bitwise.coffee',
        ],
      });
    }

    return (() => {
      const result = [];
      for (var comparisonOperator of comparisonOperators) {
        ({ tokens } = grammar.tokenizeLine(comparisonOperator));
        result.push(
          expect(tokens[0]).toEqual({
            value: comparisonOperator,
            scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
          })
        );
      }
      return result;
    })();
  });

  it('tokenizes operators properly', function () {
    let tokens;
    const logicalOperators = ['!', '&&', '||', 'and', 'or', 'not'];
    const bitwiseOperators = ['^', '~', '&', '|'];
    const comparisonOperators = ['<', '>', 'is', 'isnt'];
    const decrementOperators = ['--'];
    const incrementOperators = ['++'];
    const splatOperators = ['...'];
    const existentialOperators = ['?'];
    const operators = ['%', '*', '/', '-', '+'];
    const keywords = ['delete', 'instanceof', 'new', 'typeof'];

    for (var logicalOperator of logicalOperators) {
      ({ tokens } = grammar.tokenizeLine(logicalOperator));
      expect(tokens[0]).toEqual({
        value: logicalOperator,
        scopes: ['source.coffee', 'keyword.operator.logical.coffee'],
      });
    }

    for (var bitwiseOperator of bitwiseOperators) {
      ({ tokens } = grammar.tokenizeLine(bitwiseOperator));
      expect(tokens[0]).toEqual({
        value: bitwiseOperator,
        scopes: ['source.coffee', 'keyword.operator.bitwise.coffee'],
      });
    }

    for (var comparisonOperator of comparisonOperators) {
      ({ tokens } = grammar.tokenizeLine(comparisonOperator));
      expect(tokens[0]).toEqual({
        value: comparisonOperator,
        scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
      });
    }

    for (var decrementOperator of decrementOperators) {
      ({ tokens } = grammar.tokenizeLine(decrementOperator));
      expect(tokens[0]).toEqual({
        value: decrementOperator,
        scopes: ['source.coffee', 'keyword.operator.decrement.coffee'],
      });
    }

    for (var incrementOperator of incrementOperators) {
      ({ tokens } = grammar.tokenizeLine(incrementOperator));
      expect(tokens[0]).toEqual({
        value: incrementOperator,
        scopes: ['source.coffee', 'keyword.operator.increment.coffee'],
      });
    }

    for (var splatOperator of splatOperators) {
      ({ tokens } = grammar.tokenizeLine(splatOperator));
      expect(tokens[0]).toEqual({
        value: splatOperator,
        scopes: ['source.coffee', 'keyword.operator.splat.coffee'],
      });
    }

    for (var existentialOperator of existentialOperators) {
      ({ tokens } = grammar.tokenizeLine(existentialOperator));
      expect(tokens[0]).toEqual({
        value: existentialOperator,
        scopes: ['source.coffee', 'keyword.operator.existential.coffee'],
      });
    }

    for (var operator of operators) {
      ({ tokens } = grammar.tokenizeLine(operator));
      expect(tokens[0]).toEqual({
        value: operator,
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });
    }

    return (() => {
      const result = [];
      for (var keyword of keywords) {
        ({ tokens } = grammar.tokenizeLine(keyword));
        result.push(
          expect(tokens[0]).toEqual({
            value: keyword,
            scopes: ['source.coffee', `keyword.operator.${keyword}.coffee`],
          })
        );
      }
      return result;
    })();
  });

  it('does not tokenize non-operators as operators', function () {
    const notOperators = ['(/=', '-->', '=>', '->'];

    return (() => {
      const result = [];
      for (var notOperator of notOperators) {
        var { tokens } = grammar.tokenizeLine(notOperator);
        result.push(
          expect(tokens[0]).not.toEqual({
            value: notOperator,
            scopes: ['source.coffee', 'keyword.operator.coffee'],
          })
        );
      }
      return result;
    })();
  });

  describe('properties', function () {
    it('tokenizes properties', function () {
      let { tokens } = grammar.tokenizeLine('obj.property');
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'property',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj.property instanceof Object'));
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'property',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj.property.property'));
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'property',
        scopes: ['source.coffee', 'variable.other.object.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj.Property'));
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'Property',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj.prop1?.prop2?'));
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'prop1',
        scopes: ['source.coffee', 'variable.other.object.property.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: '?',
        scopes: ['source.coffee', 'keyword.operator.existential.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: 'prop2',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });
      expect(tokens[6]).toEqual({
        value: '?',
        scopes: ['source.coffee', 'keyword.operator.existential.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj.$abc$'));
      expect(tokens[2]).toEqual({
        value: '$abc$',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj.$$'));
      expect(tokens[2]).toEqual({
        value: '$$',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('a().b'));
      expect(tokens[2]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'b',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('a.123illegal'));
      expect(tokens[0]).toEqual({ value: 'a', scopes: ['source.coffee'] });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      return expect(tokens[2]).toEqual({
        value: '123illegal',
        scopes: ['source.coffee', 'invalid.illegal.identifier.coffee'],
      });
    });

    it('tokenizes constant properties', function () {
      let { tokens } = grammar.tokenizeLine('obj.MY_CONSTANT');
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'MY_CONSTANT',
        scopes: ['source.coffee', 'constant.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj.MY_CONSTANT.prop'));
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'MY_CONSTANT',
        scopes: ['source.coffee', 'constant.other.object.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('a.C'));
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      return expect(tokens[2]).toEqual({
        value: 'C',
        scopes: ['source.coffee', 'constant.other.property.coffee'],
      });
    });

    return it('tokenizes objects, methods, and properties using :: prototype syntax', function () {
      let { tokens } = grammar.tokenizeLine('Foo::');
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::true'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'true',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::on'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'on',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::yes'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'yes',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::false'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'false',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::off'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'off',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::no'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'no',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::null'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'null',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::extends'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'extends',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo :: something :: else'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[2]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[3]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[4]).toEqual({
        value: 'something',
        scopes: ['source.coffee', 'variable.other.object.property.coffee'],
      });
      expect(tokens[5]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[6]).toEqual({
        value: '::',
        scopes: ['source.coffee', 'keyword.operator.prototype.coffee'],
      });
      expect(tokens[7]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[8]).toEqual({
        value: 'else',
        scopes: ['source.coffee', 'variable.other.property.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('Foo::toString()'));
      expect(tokens[0]).toEqual({
        value: 'Foo',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '::',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'keyword.operator.prototype.coffee',
        ],
      });
      return expect(tokens[2]).toEqual({
        value: 'toString',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'support.function.coffee',
        ],
      });
    });
  });

  describe('variables', function () {
    it("tokenizes 'this'", function () {
      let { tokens } = grammar.tokenizeLine('this');
      expect(tokens[0]).toEqual({
        value: 'this',
        scopes: ['source.coffee', 'variable.language.this.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('this.obj.prototype = new El()'));
      expect(tokens[0]).toEqual({
        value: 'this',
        scopes: ['source.coffee', 'variable.language.this.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('$this'));
      expect(tokens[0]).toEqual({ value: '$this', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine('this$'));
      return expect(tokens[0]).toEqual({
        value: 'this$',
        scopes: ['source.coffee'],
      });
    });

    it("tokenizes 'super'", function () {
      const { tokens } = grammar.tokenizeLine('super');
      return expect(tokens[0]).toEqual({
        value: 'super',
        scopes: ['source.coffee', 'variable.language.super.coffee'],
      });
    });

    it("tokenizes 'arguments'", function () {
      let { tokens } = grammar.tokenizeLine('arguments');
      expect(tokens[0]).toEqual({
        value: 'arguments',
        scopes: ['source.coffee', 'variable.language.arguments.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('arguments[0]'));
      expect(tokens[0]).toEqual({
        value: 'arguments',
        scopes: ['source.coffee', 'variable.language.arguments.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('arguments.length'));
      return expect(tokens[0]).toEqual({
        value: 'arguments',
        scopes: ['source.coffee', 'variable.language.arguments.coffee'],
      });
    });

    return it('tokenizes illegal identifiers', function () {
      let { tokens } = grammar.tokenizeLine('0illegal');
      expect(tokens[0]).toEqual({
        value: '0illegal',
        scopes: ['source.coffee', 'invalid.illegal.identifier.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('123illegal'));
      expect(tokens[0]).toEqual({
        value: '123illegal',
        scopes: ['source.coffee', 'invalid.illegal.identifier.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('123$illegal'));
      return expect(tokens[0]).toEqual({
        value: '123$illegal',
        scopes: ['source.coffee', 'invalid.illegal.identifier.coffee'],
      });
    });
  });

  describe('objects', function () {
    it('tokenizes them', function () {
      let { tokens } = grammar.tokenizeLine('obj.prop');
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('$abc$.prop'));
      expect(tokens[0]).toEqual({
        value: '$abc$',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('$$.prop'));
      expect(tokens[0]).toEqual({
        value: '$$',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('obj?.prop'));
      expect(tokens[0]).toEqual({
        value: 'obj',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      return expect(tokens[1]).toEqual({
        value: '?',
        scopes: ['source.coffee', 'keyword.operator.existential.coffee'],
      });
    });

    return it('tokenizes illegal objects', function () {
      let { tokens } = grammar.tokenizeLine('1.prop');
      expect(tokens[0]).toEqual({
        value: '1',
        scopes: ['source.coffee', 'invalid.illegal.identifier.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('123.prop'));
      expect(tokens[0]).toEqual({
        value: '123',
        scopes: ['source.coffee', 'invalid.illegal.identifier.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('123a.prop'));
      return expect(tokens[0]).toEqual({
        value: '123a',
        scopes: ['source.coffee', 'invalid.illegal.identifier.coffee'],
      });
    });
  });

  describe('arrays', function () {
    it('tokenizes basic arrays', function () {
      const { tokens } = grammar.tokenizeLine('[a, "b", 3]');
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({ value: 'a', scopes: ['source.coffee'] });
      expect(tokens[2]).toEqual({
        value: ',',
        scopes: ['source.coffee', 'punctuation.separator.delimiter.coffee'],
      });
      expect(tokens[3]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[9]).toEqual({
        value: '3',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      return expect(tokens[10]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });
    });

    return it('tokenizes inclusive and exclusive slices', function () {
      let { tokens } = grammar.tokenizeLine('[a..3]');
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({ value: 'a', scopes: ['source.coffee'] });
      expect(tokens[2]).toEqual({
        value: '..',
        scopes: ['source.coffee', 'keyword.operator.slice.inclusive.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: '3',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('[3...b]'));
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '3',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '...',
        scopes: ['source.coffee', 'keyword.operator.slice.exclusive.coffee'],
      });
      expect(tokens[3]).toEqual({ value: 'b', scopes: ['source.coffee'] });
      return expect(tokens[4]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });
    });
  });

  it('verifies that regular expressions have explicit count modifiers', function () {
    let source = fs.readFileSync(
      path.resolve(__dirname, '..', 'grammars', 'coffeescript.cson'),
      'utf8'
    );
    expect(source.search(/{,/)).toEqual(-1);

    source = fs.readFileSync(
      path.resolve(__dirname, '..', 'grammars', 'coffeescript (literate).cson'),
      'utf8'
    );
    return expect(source.search(/{,/)).toEqual(-1);
  });

  it('tokenizes embedded JavaScript', function () {
    waitsForPromise(() => atom.packages.activatePackage('language-javascript'));

    return runs(function () {
      let { tokens } = grammar.tokenizeLine('`;`');
      expect(tokens[0]).toEqual({
        value: '`',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ';',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'source.js.embedded.coffee',
          'punctuation.terminator.statement.js',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '`',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      const lines = grammar.tokenizeLines(`\
\`var a = 1;\`
a = 2\
`);
      expect(lines[0][0]).toEqual({
        value: '`',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(lines[0][1]).toEqual({
        value: 'var',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'source.js.embedded.coffee',
          'storage.type.var.js',
        ],
      });
      expect(lines[0][6]).toEqual({
        value: ';',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'source.js.embedded.coffee',
          'punctuation.terminator.statement.js',
        ],
      });
      expect(lines[0][7]).toEqual({
        value: '`',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(lines[1][0]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.assignment.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('`// comment` a = 2'));
      expect(tokens[0]).toEqual({
        value: '`',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '//',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'source.js.embedded.coffee',
          'comment.line.double-slash.js',
          'punctuation.definition.comment.js',
        ],
      });
      expect(tokens[2]).toEqual({
        value: ' comment',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'source.js.embedded.coffee',
          'comment.line.double-slash.js',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '`',
        scopes: [
          'source.coffee',
          'string.quoted.script.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      return expect(tokens[5]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.assignment.coffee'],
      });
    });
  });

  describe('function calls', function () {
    it('tokenizes function calls', function () {
      let { tokens } = grammar.tokenizeLine('functionCall()');
      expect(tokens[0]).toEqual({
        value: 'functionCall',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine(
        'functionCall(arg1, "test", {a: 123})'
      ));
      expect(tokens[0]).toEqual({
        value: 'functionCall',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'arg1',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: 'test',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.double.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[10]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.brace.curly.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'variable.assignment.coffee',
        ],
      });
      expect(tokens[12]).toEqual({
        value: ':',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[14]).toEqual({
        value: '123',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });
      expect(tokens[15]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.brace.curly.coffee',
        ],
      });
      expect(tokens[16]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('functionCall((123).toString())'));
      expect(tokens[1]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.brace.round.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '123',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.brace.round.coffee',
        ],
      });
      expect(tokens[9]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('$abc$()'));
      expect(tokens[0]).toEqual({
        value: '$abc$',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('$$()'));
      expect(tokens[0]).toEqual({
        value: '$$',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('ABC()'));
      expect(tokens[0]).toEqual({
        value: 'ABC',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('$ABC$()'));
      expect(tokens[0]).toEqual({
        value: '$ABC$',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('@$()'));
      expect(tokens[0]).toEqual({
        value: '@',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '$',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine(
        'functionCall arg1, "test", {a: 123}'
      ));
      expect(tokens[0]).toEqual({
        value: 'functionCall',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'arg1',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: 'test',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.double.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[10]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.brace.curly.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'variable.assignment.coffee',
        ],
      });
      expect(tokens[12]).toEqual({
        value: ':',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[14]).toEqual({
        value: '123',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });
      expect(tokens[15]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.brace.curly.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('foo bar'));
      expect(tokens[0]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function-call.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'bar',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('foo not food'));
      expect(tokens[0]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function-call.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'not',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'keyword.operator.logical.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' food',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('eat food for food in foods'));
      expect(tokens[0]).toEqual({
        value: 'eat',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'food',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'for',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[5]).toEqual({ value: ' food ', scopes: ['source.coffee'] });
      expect(tokens[6]).toEqual({
        value: 'in',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[7]).toEqual({ value: ' foods', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine('(eat food for food in get foods)'));
      expect(tokens[0]).toEqual({
        value: '(',
        scopes: ['source.coffee', 'meta.brace.round.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: 'eat',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'food',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: 'for',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[6]).toEqual({ value: ' food ', scopes: ['source.coffee'] });
      expect(tokens[7]).toEqual({
        value: 'in',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[9]).toEqual({
        value: 'get',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: 'foods',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[12]).toEqual({
        value: ')',
        scopes: ['source.coffee', 'meta.brace.round.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('[eat food]'));
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'eat',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'food',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('foo @bar'));
      expect(tokens[0]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '@bar',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('@foo bar'));
      expect(tokens[0]).toEqual({
        value: '@',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'bar',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('foo baz, @bar'));
      expect(tokens[0]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'baz',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '@bar',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('$ @$'));
      expect(tokens[0]).toEqual({
        value: '$',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      return expect(tokens[2]).toEqual({
        value: '@$',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });
    });

    it('tokenizes function calls when they are arguments', function () {
      let { tokens } = grammar.tokenizeLine('a(b(c))');
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'c',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a b c'));
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      return expect(tokens[4]).toEqual({
        value: 'c',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
    });

    it('tokenizes illegal function calls', function () {
      const { tokens } = grammar.tokenizeLine('0illegal()');
      expect(tokens[0]).toEqual({
        value: '0illegal',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'invalid.illegal.identifier.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      return expect(tokens[2]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });
    });

    it('tokenizes illegal arguments', function () {
      let { tokens } = grammar.tokenizeLine('a(1a)');
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '1a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'invalid.illegal.identifier.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a(123a)'));
      expect(tokens[2]).toEqual({
        value: '123a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'invalid.illegal.identifier.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a(1.prop)'));
      expect(tokens[2]).toEqual({
        value: '1',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'invalid.illegal.identifier.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.separator.property.period.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'prop',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'variable.other.property.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a 1a'));
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      return expect(tokens[2]).toEqual({
        value: '1a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'invalid.illegal.identifier.coffee',
        ],
      });
    });

    it('tokenizes function declaration as an argument', function () {
      const { tokens } = grammar.tokenizeLine('a((p) -> return p )');
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'p',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: 'return',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'keyword.control.coffee',
        ],
      });
      expect(tokens[9]).toEqual({
        value: ' p ',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      return expect(tokens[10]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });
    });

    it('does not tokenize booleans as function calls', function () {
      let { tokens } = grammar.tokenizeLine('false unless true');
      expect(tokens[0]).toEqual({
        value: 'false',
        scopes: ['source.coffee', 'constant.language.boolean.false.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'unless',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: 'true',
        scopes: ['source.coffee', 'constant.language.boolean.true.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('true if false'));
      expect(tokens[0]).toEqual({
        value: 'true',
        scopes: ['source.coffee', 'constant.language.boolean.true.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: 'if',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      return expect(tokens[4]).toEqual({
        value: 'false',
        scopes: ['source.coffee', 'constant.language.boolean.false.coffee'],
      });
    });

    return it('does not tokenize comparison operators as function calls', function () {
      const { tokens } = grammar.tokenizeLine('if a is b');
      expect(tokens[1]).toEqual({ value: ' a ', scopes: ['source.coffee'] });
      expect(tokens[2]).toEqual({
        value: 'is',
        scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
      });
      return expect(tokens[3]).toEqual({
        value: ' b',
        scopes: ['source.coffee'],
      });
    });
  });

  describe('functions', function () {
    it('tokenizes regular functions', function () {
      let { tokens } = grammar.tokenizeLine('foo = -> 1');
      expect(tokens[0]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[5]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[6]).toEqual({
        value: '1',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('@foo = -> 1'));
      expect(tokens[0]).toEqual({
        value: '@',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'entity.name.function.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('$ = => 1'));
      expect(tokens[0]).toEqual({
        value: '$',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('foo: -> 1'));
      expect(tokens[0]).toEqual({
        value: 'foo',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ':',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[4]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[5]).toEqual({
        value: '1',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine("'quoted': (a) => true"));
      expect(tokens[0]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'quoted',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'string.quoted.single.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ':',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[5]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[9]).toEqual({
        value: '=>',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[10]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[11]).toEqual({
        value: 'true',
        scopes: ['source.coffee', 'constant.language.boolean.true.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('"quoted": (a) -> true'));
      expect(tokens[0]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'quoted',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'string.quoted.double.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ':',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[5]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[9]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[10]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[11]).toEqual({
        value: 'true',
        scopes: ['source.coffee', 'constant.language.boolean.true.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('hello: (a) -> 1'));
      expect(tokens[0]).toEqual({
        value: 'hello',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ':',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.coffee'],
      });
      expect(tokens[7]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[9]).toEqual({
        value: '1',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine(
        "hello: (a, b, {c, d}, e = 'test', f = 3, g = -> 4) -> 1"
      ));
      expect(tokens[0]).toEqual({
        value: 'hello',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ':',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: ' ',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[10]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'meta.brace.curly.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: 'c',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
        ],
      });
      expect(tokens[12]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[13]).toEqual({
        value: ' d',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
        ],
      });
      expect(tokens[14]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'meta.brace.curly.coffee',
        ],
      });
      expect(tokens[17]).toEqual({
        value: 'e',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[19]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[21]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[24]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[26]).toEqual({
        value: 'f',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[30]).toEqual({
        value: '3',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });
      expect(tokens[33]).toEqual({
        value: 'g',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[35]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[37]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[40]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      return expect(tokens[42]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.coffee',
          'storage.type.function.coffee',
        ],
      });
    });

    return it('tokenizes inline functions', function () {
      let { tokens } = grammar.tokenizeLine('-> true');
      expect(tokens[0]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[1]).toEqual({ value: ' ', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine(' -> true'));
      expect(tokens[0]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[1]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({ value: ' ', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine('->true'));
      expect(tokens[0]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('(arg) -> true'));
      expect(tokens[0]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'arg',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.inline.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[5]).toEqual({ value: ' ', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine('(arg1, arg2) -> true'));
      expect(tokens[0]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'arg1',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'arg2',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.function.inline.coffee'],
      });
      expect(tokens[7]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[8]).toEqual({ value: ' ', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine('( arg1, arg2 )-> true'));
      expect(tokens[0]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ' ',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'arg1',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ' ',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: 'arg2',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: ' ',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });
      return expect(tokens[9]).toEqual({
        value: ' ',
        scopes: ['source.coffee'],
      });
    });
  });

  describe('method calls', () =>
    it('tokenizes method calls', function () {
      let { tokens } = grammar.tokenizeLine('a.b(1+1)');
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: '1',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '+',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'keyword.operator.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: '1',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a . b(1+1)'));
      expect(tokens[2]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.$abc$()'));
      expect(tokens[2]).toEqual({
        value: '$abc$',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.$$()'));
      expect(tokens[2]).toEqual({
        value: '$$',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.b c'));
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.method-call.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: 'c',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('(a.b c)'));
      expect(tokens[0]).toEqual({
        value: '(',
        scopes: ['source.coffee', 'meta.brace.round.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.method-call.coffee'],
      });
      expect(tokens[5]).toEqual({
        value: 'c',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: ')',
        scopes: ['source.coffee', 'meta.brace.round.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('[a.b c]'));
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.method-call.coffee'],
      });
      expect(tokens[5]).toEqual({
        value: 'c',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.b not c'));
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.method-call.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: 'not',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'keyword.operator.logical.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: ' c',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.b 1+1'));
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.method-call.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: '1',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '+',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'keyword.operator.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: '1',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'constant.numeric.decimal.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.b @'));
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: '@',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.$abc$ "q"'));
      expect(tokens[2]).toEqual({
        value: '$abc$',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.$$ 4'));
      expect(tokens[2]).toEqual({
        value: '$$',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('a.b @$'));
      expect(tokens[0]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'variable.other.object.coffee'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'punctuation.separator.method.period.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.method-call.coffee'],
      });
      return expect(tokens[4]).toEqual({
        value: '@$',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });
    }));

  describe('destructuring assignments', function () {
    it('tokenizes object and array destructuring', function () {
      let { tokens } = grammar.tokenizeLine('{something} = hi');
      expect(tokens[0]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.begin.bracket.curly.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'something',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'variable.assignment.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.end.bracket.curly.coffee',
        ],
      });
      expect(tokens[3]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[4]).toEqual({
        value: '=',
        scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
      });
      expect(tokens[5]).toEqual({ value: ' hi', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine(
        '[x, y] = browserWindow.getPosition()'
      ));
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'punctuation.definition.destructuring.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'x',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'variable.assignment.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: ',',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'punctuation.separator.delimiter.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: ' ',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.array.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'y',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'variable.assignment.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'punctuation.definition.destructuring.end.bracket.square.coffee',
        ],
      });
      expect(tokens[6]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[7]).toEqual({
        value: '=',
        scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
      });
      expect(tokens[8]).toEqual({ value: ' ', scopes: ['source.coffee'] });

      ({ tokens } = grammar.tokenizeLine("{'} ='}")); // Make sure this *isn't* tokenized as a destructuring assignment
      expect(tokens[0]).not.toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.begin.bracket.curly.coffee',
        ],
      });
      return expect(tokens[0]).toEqual({
        value: '{',
        scopes: ['source.coffee', 'meta.brace.curly.coffee'],
      });
    });

    it('tokenizes nested destructuring assignments', function () {
      const { tokens } = grammar.tokenizeLine(
        '{poet: {name, address: [street, city]}} = futurists'
      );
      expect(tokens[0]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.begin.bracket.curly.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.begin.bracket.curly.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'punctuation.definition.destructuring.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[16]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'punctuation.definition.destructuring.end.bracket.square.coffee',
        ],
      });
      expect(tokens[17]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.end.bracket.curly.coffee',
        ],
      });
      expect(tokens[18]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.end.bracket.curly.coffee',
        ],
      });
      expect(tokens[19]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      return expect(tokens[20]).toEqual({
        value: '=',
        scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
      });
    });

    it('tokenizes multiple nested destructuring assignments', function () {
      const { tokens } = grammar.tokenizeLine(
        '{start: {row: startRow}, end: {row: endRow}} = range'
      );
      expect(tokens[0]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.begin.bracket.curly.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.begin.bracket.curly.coffee',
        ],
      });
      expect(tokens[9]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.end.bracket.curly.coffee',
        ],
      });
      expect(tokens[15]).toEqual({
        value: '{',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.begin.bracket.curly.coffee',
        ],
      });
      expect(tokens[20]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.end.bracket.curly.coffee',
        ],
      });
      expect(tokens[21]).toEqual({
        value: '}',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.object.coffee',
          'punctuation.definition.destructuring.end.bracket.curly.coffee',
        ],
      });
      expect(tokens[22]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      return expect(tokens[23]).toEqual({
        value: '=',
        scopes: ['source.coffee', 'keyword.operator.assignment.coffee'],
      });
    });

    return it("doesn't tokenize nested brackets as destructuring assignments", function () {
      const { tokens } = grammar.tokenizeLine(
        '[new Point(0, 1), [new Point(0, 0),new Point(0, 1)]]'
      );
      expect(tokens[0]).not.toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'meta.variable.assignment.destructured.array.coffee',
          'punctuation.definition.destructuring.begin.bracket.square.coffee',
        ],
      });
      return expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
    });
  });

  it('tokenizes inline constant followed by unless statement correctly', function () {
    const { tokens } = grammar.tokenizeLine('return 0 unless true');
    expect(tokens[0]).toEqual({
      value: 'return',
      scopes: ['source.coffee', 'keyword.control.coffee'],
    });
    expect(tokens[2]).toEqual({
      value: '0',
      scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
    });
    expect(tokens[4]).toEqual({
      value: 'unless',
      scopes: ['source.coffee', 'keyword.control.coffee'],
    });
    return expect(tokens[6]).toEqual({
      value: 'true',
      scopes: ['source.coffee', 'constant.language.boolean.true.coffee'],
    });
  });

  describe('for loops', function () {
    it('tokenizes for-in loops', function () {
      const { tokens } = grammar.tokenizeLine('for food in foods');
      expect(tokens[0]).toEqual({
        value: 'for',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[1]).toEqual({ value: ' food ', scopes: ['source.coffee'] });
      expect(tokens[2]).toEqual({
        value: 'in',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      return expect(tokens[3]).toEqual({
        value: ' foods',
        scopes: ['source.coffee'],
      });
    });

    it('tokenizes for-of loops', function () {
      const { tokens } = grammar.tokenizeLine('for food, type of foods');
      expect(tokens[0]).toEqual({
        value: 'for',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[1]).toEqual({ value: ' food', scopes: ['source.coffee'] });
      expect(tokens[2]).toEqual({
        value: ',',
        scopes: ['source.coffee', 'punctuation.separator.delimiter.coffee'],
      });
      expect(tokens[3]).toEqual({ value: ' type ', scopes: ['source.coffee'] });
      expect(tokens[4]).toEqual({
        value: 'of',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      return expect(tokens[5]).toEqual({
        value: ' foods',
        scopes: ['source.coffee'],
      });
    });

    it('tokenizes loops using arrays', function () {
      const { tokens } = grammar.tokenizeLine(
        "for food in ['broccoli', 'spinach', 'chocolate']"
      );
      expect(tokens[0]).toEqual({
        value: 'for',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[1]).toEqual({ value: ' food ', scopes: ['source.coffee'] });
      expect(tokens[2]).toEqual({
        value: 'in',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[3]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[4]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      return expect(tokens[18]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });
    });

    it('tokenizes loops using the optional `when` keyword', function () {
      const { tokens } = grammar.tokenizeLine(
        'for food in foods when food isnt chocolate'
      );
      expect(tokens[0]).toEqual({
        value: 'for',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: ' foods ',
        scopes: ['source.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: 'when',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[5]).toEqual({ value: ' food ', scopes: ['source.coffee'] });
      expect(tokens[6]).toEqual({
        value: 'isnt',
        scopes: ['source.coffee', 'keyword.operator.comparison.coffee'],
      });
      return expect(tokens[7]).toEqual({
        value: ' chocolate',
        scopes: ['source.coffee'],
      });
    });

    return it('tokenizes loops using the optional `by` keyword', function () {
      const { tokens } = grammar.tokenizeLine('for food in foods by -1');
      expect(tokens[0]).toEqual({
        value: 'for',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: ' foods ',
        scopes: ['source.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: 'by',
        scopes: ['source.coffee', 'keyword.control.coffee'],
      });
      expect(tokens[5]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[6]).toEqual({
        value: '-',
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });
      return expect(tokens[7]).toEqual({
        value: '1',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
    });
  });

  describe('regular expressions', function () {
    beforeEach(() =>
      waitsForPromise(() =>
        atom.packages.activatePackage('language-javascript')
      )
    ); // Provides the regexp subgrammar

    it('tokenizes regular expressions', function () {
      let { tokens } = grammar.tokenizeLine('/test/');
      expect(tokens[0]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'test',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine("/{'}/"));
      expect(tokens[0]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('foo + /test/'));
      expect(tokens[0]).toEqual({ value: 'foo ', scopes: ['source.coffee'] });
      expect(tokens[1]).toEqual({
        value: '+',
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });
      expect(tokens[2]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[3]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'test',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      return expect(tokens[5]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });

    it('tokenizes regular expressions containing spaces', function () {
      const { tokens } = grammar.tokenizeLine('/ te st /');
      expect(tokens[0]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: ' te st ',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      return expect(tokens[2]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });

    it('tokenizes regular expressions containing escaped forward slashes', function () {
      let { tokens } = grammar.tokenizeLine('/test\\//');
      expect(tokens[0]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'test',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '\\/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'constant.character.escape.backslash.regexp',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('/one\\/two!\\/three/'));
      expect(tokens[0]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'one',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '\\/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'constant.character.escape.backslash.regexp',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'two!',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      expect(tokens[4]).toEqual({
        value: '\\/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'constant.character.escape.backslash.regexp',
        ],
      });
      expect(tokens[5]).toEqual({
        value: 'three',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      return expect(tokens[6]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });

    it('tokenizes regular expressions inside arrays', function () {
      let { tokens } = grammar.tokenizeLine('[/test/]');
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'test',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('[1, /test/]'));
      expect(tokens[0]).toEqual({
        value: '[',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.begin.bracket.square.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '1',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: ',',
        scopes: ['source.coffee', 'punctuation.separator.delimiter.coffee'],
      });
      expect(tokens[3]).toEqual({ value: ' ', scopes: ['source.coffee'] });
      expect(tokens[4]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: 'test',
        scopes: ['source.coffee', 'string.regexp.coffee'],
      });
      expect(tokens[6]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      return expect(tokens[7]).toEqual({
        value: ']',
        scopes: [
          'source.coffee',
          'punctuation.definition.array.end.bracket.square.coffee',
        ],
      });
    });

    it('does not tokenize multiple division as regex', function () {
      // https://github.com/atom/language-coffee-script/issues/112
      let { tokens } = grammar.tokenizeLine('a / b + c / d');
      expect(tokens[1]).toEqual({
        value: '/',
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });
      expect(tokens[2]).toEqual({ value: ' b ', scopes: ['source.coffee'] });
      expect(tokens[5]).toEqual({
        value: '/',
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('a / 2 / (3)'));
      expect(tokens[1]).toEqual({
        value: '/',
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: '2',
        scopes: ['source.coffee', 'constant.numeric.decimal.coffee'],
      });
      return expect(tokens[5]).toEqual({
        value: '/',
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });
    });

    it('does not tokenize comments with URLs in them as regex', function () {
      // Disclaimer: This does not fix when comments contain only slashes, such as `a / something # comment /`
      const { tokens } = grammar.tokenizeLine(
        'canvas.width/2 # https://github.com/atom/language-coffee-script/issues/112'
      );
      expect(tokens[3]).toEqual({
        value: '/',
        scopes: ['source.coffee', 'keyword.operator.coffee'],
      });
      expect(tokens[6]).toEqual({
        value: '#',
        scopes: [
          'source.coffee',
          'comment.line.number-sign.coffee',
          'punctuation.definition.comment.coffee',
        ],
      });
      return expect(tokens[7]).toEqual({
        value: ' https://github.com/atom/language-coffee-script/issues/112',
        scopes: ['source.coffee', 'comment.line.number-sign.coffee'],
      });
    });

    it('stops tokenizing regex at the first non-escaped forwards slash', function () {
      let { tokens } = grammar.tokenizeLine("path.replace(/\\\\/g, '/')");
      expect(tokens[4]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.single.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine("path.replace(/\\\\\\//g, '/')"));
      expect(tokens[4]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: '\\/',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'string.regexp.coffee',
          'constant.character.escape.backslash.regexp',
        ],
      });
      expect(tokens[7]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'string.regexp.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      return expect(tokens[12]).toEqual({
        value: '/',
        scopes: [
          'source.coffee',
          'meta.method-call.coffee',
          'meta.arguments.coffee',
          'string.quoted.single.coffee',
        ],
      });
    });

    return it('tokenises multi-line regular expressions', function () {
      const { tokens } = grammar.tokenizeLine('/// (XYZ) ///');
      expect(tokens[0]).toEqual({
        value: '///',
        scopes: [
          'source.coffee',
          'string.regexp.multiline.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'string.regexp.multiline.coffee',
          'meta.group.regexp',
          'punctuation.definition.group.regexp',
        ],
      });
      expect(tokens[3]).toEqual({
        value: 'XYZ',
        scopes: [
          'source.coffee',
          'string.regexp.multiline.coffee',
          'meta.group.regexp',
        ],
      });
      expect(tokens[4]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'string.regexp.multiline.coffee',
          'meta.group.regexp',
          'punctuation.definition.group.regexp',
        ],
      });
      expect(tokens[6]).toEqual({
        value: '///',
        scopes: [
          'source.coffee',
          'string.regexp.multiline.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      const lines = grammar.tokenizeLines(`\
///
XYZ //
/~/
///\
`);
      expect(lines[0][0]).toEqual({
        value: '///',
        scopes: [
          'source.coffee',
          'string.regexp.multiline.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(lines[1][0]).toEqual({
        value: 'XYZ //',
        scopes: ['source.coffee', 'string.regexp.multiline.coffee'],
      });
      expect(lines[2][0]).toEqual({
        value: '/~/',
        scopes: ['source.coffee', 'string.regexp.multiline.coffee'],
      });
      return expect(lines[3][0]).toEqual({
        value: '///',
        scopes: [
          'source.coffee',
          'string.regexp.multiline.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });
  });

  describe('here-docs', function () {
    it('tokenises single-quoted here-docs', function () {
      const { tokens } = grammar.tokenizeLine("'''XYZ'''");
      expect(tokens[0]).toEqual({
        value: "'''",
        scopes: [
          'source.coffee',
          'string.quoted.single.heredoc.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'XYZ',
        scopes: ['source.coffee', 'string.quoted.single.heredoc.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: "'''",
        scopes: [
          'source.coffee',
          'string.quoted.single.heredoc.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      const lines = grammar.tokenizeLines(`\
'''
'ABC'
XYZ ''
'''\
`);
      expect(lines[0][0]).toEqual({
        value: "'''",
        scopes: [
          'source.coffee',
          'string.quoted.single.heredoc.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(lines[1][0]).toEqual({
        value: "'ABC'",
        scopes: ['source.coffee', 'string.quoted.single.heredoc.coffee'],
      });
      expect(lines[2][0]).toEqual({
        value: "XYZ ''",
        scopes: ['source.coffee', 'string.quoted.single.heredoc.coffee'],
      });
      return expect(lines[3][0]).toEqual({
        value: "'''",
        scopes: [
          'source.coffee',
          'string.quoted.single.heredoc.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });

    return it('tokenises double-quoted here-docs', function () {
      const { tokens } = grammar.tokenizeLine("'''XYZ'''");
      expect(tokens[0]).toEqual({
        value: "'''",
        scopes: [
          'source.coffee',
          'string.quoted.single.heredoc.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'XYZ',
        scopes: ['source.coffee', 'string.quoted.single.heredoc.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: "'''",
        scopes: [
          'source.coffee',
          'string.quoted.single.heredoc.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      const lines = grammar.tokenizeLines(`\
"""
"ABC"
XYZ ""
"""\
`);
      expect(lines[0][0]).toEqual({
        value: '"""',
        scopes: [
          'source.coffee',
          'string.quoted.double.heredoc.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(lines[1][0]).toEqual({
        value: '"ABC"',
        scopes: ['source.coffee', 'string.quoted.double.heredoc.coffee'],
      });
      expect(lines[2][0]).toEqual({
        value: 'XYZ ""',
        scopes: ['source.coffee', 'string.quoted.double.heredoc.coffee'],
      });
      return expect(lines[3][0]).toEqual({
        value: '"""',
        scopes: [
          'source.coffee',
          'string.quoted.double.heredoc.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });
  });

  describe('escape sequences in strings', function () {
    it('tokenises leading backslashes in double-quoted strings', function () {
      let { tokens } = grammar.tokenizeLine('"a\\\\b\\\\\\\\c"');
      expect(tokens[0]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'string.quoted.double.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'b',
        scopes: ['source.coffee', 'string.quoted.double.coffee'],
      });
      expect(tokens[5]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[9]).toEqual({
        value: 'c',
        scopes: ['source.coffee', 'string.quoted.double.coffee'],
      });
      expect(tokens[10]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('"\\a\\t\\a\\b"'));
      expect(tokens[0]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 't',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      return expect(tokens[9]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });

    return it('tokenises leading backslashes in single-quoted strings', function () {
      let { tokens } = grammar.tokenizeLine("'a\\\\b\\\\\\\\c'");
      expect(tokens[0]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'a',
        scopes: ['source.coffee', 'string.quoted.single.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'b',
        scopes: ['source.coffee', 'string.quoted.single.coffee'],
      });
      expect(tokens[5]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[9]).toEqual({
        value: 'c',
        scopes: ['source.coffee', 'string.quoted.single.coffee'],
      });
      expect(tokens[10]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });

      ({ tokens } = grammar.tokenizeLine("'\\a\\t\\a\\b'"));
      expect(tokens[0]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[2]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[3]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 't',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: 'a',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: '\\',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
          'punctuation.definition.escape.backslash.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: 'b',
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'constant.character.escape.backslash.coffee',
        ],
      });
      return expect(tokens[9]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
    });
  });

  describe('jsx', function () {
    it('tokenises HTML tags', function () {
      let { tokens } = grammar.tokenizeLine('<div></div>');
      expect(tokens[0]).toEqual({
        value: '<',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'punctuation.definition.tag.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'div',
        scopes: ['source.coffee', 'meta.tag.coffee', 'entity.name.tag.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: '>',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: '</',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'punctuation.definition.tag.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: 'div',
        scopes: ['source.coffee', 'meta.tag.coffee', 'entity.name.tag.coffee'],
      });
      expect(tokens[5]).toEqual({
        value: '>',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });

      ({ tokens } = grammar.tokenizeLine('<div/>'));
      expect(tokens[0]).toEqual({
        value: '<',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'punctuation.definition.tag.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'div',
        scopes: ['source.coffee', 'meta.tag.coffee', 'entity.name.tag.coffee'],
      });
      return expect(tokens[2]).toEqual({
        value: '/>',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });
    });

    it('tokenises HTML tags with attributes', function () {
      const { tokens } = grammar.tokenizeLine(
        '<div class=\'myclass\' id="myid">'
      );
      expect(tokens[0]).toEqual({
        value: '<',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'punctuation.definition.tag.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'div',
        scopes: ['source.coffee', 'meta.tag.coffee', 'entity.name.tag.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: 'class',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'entity.other.attribute-name.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[6]).toEqual({
        value: 'myclass',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'string.quoted.single.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: "'",
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'string.quoted.single.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });
      expect(tokens[9]).toEqual({
        value: 'id',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'entity.other.attribute-name.coffee',
        ],
      });
      expect(tokens[10]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.begin.coffee',
        ],
      });
      expect(tokens[12]).toEqual({
        value: 'myid',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'string.quoted.double.coffee',
        ],
      });
      expect(tokens[13]).toEqual({
        value: '"',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'string.quoted.double.coffee',
          'punctuation.definition.string.end.coffee',
        ],
      });
      return expect(tokens[14]).toEqual({
        value: '>',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });
    });

    return it('tokenises HTML tags with attributes that have expressions', function () {
      const { tokens } = grammar.tokenizeLine(
        '<div on-click={(e)->@handleClick(e)}>'
      );
      expect(tokens[0]).toEqual({
        value: '<',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'punctuation.definition.tag.coffee',
        ],
      });
      expect(tokens[1]).toEqual({
        value: 'div',
        scopes: ['source.coffee', 'meta.tag.coffee', 'entity.name.tag.coffee'],
      });
      expect(tokens[2]).toEqual({
        value: ' ',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });
      expect(tokens[3]).toEqual({
        value: 'on-click',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'entity.other.attribute-name.coffee',
        ],
      });
      expect(tokens[4]).toEqual({
        value: '=',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'keyword.operator.assignment.coffee',
        ],
      });
      expect(tokens[5]).toEqual({
        value: '{',
        scopes: ['source.coffee', 'meta.tag.coffee', 'meta.brace.curly.coffee'],
      });
      expect(tokens[6]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[7]).toEqual({
        value: 'e',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'variable.parameter.function.coffee',
        ],
      });
      expect(tokens[8]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function.inline.coffee',
          'meta.parameters.coffee',
          'punctuation.definition.parameters.end.bracket.round.coffee',
        ],
      });
      expect(tokens[9]).toEqual({
        value: '->',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function.inline.coffee',
          'storage.type.function.coffee',
        ],
      });
      expect(tokens[10]).toEqual({
        value: '@',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function-call.coffee',
          'variable.other.readwrite.instance.coffee',
        ],
      });
      expect(tokens[11]).toEqual({
        value: 'handleClick',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function-call.coffee',
          'entity.name.function.coffee',
        ],
      });
      expect(tokens[12]).toEqual({
        value: '(',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.begin.bracket.round.coffee',
        ],
      });
      expect(tokens[13]).toEqual({
        value: 'e',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
        ],
      });
      expect(tokens[14]).toEqual({
        value: ')',
        scopes: [
          'source.coffee',
          'meta.tag.coffee',
          'meta.function-call.coffee',
          'meta.arguments.coffee',
          'punctuation.definition.arguments.end.bracket.round.coffee',
        ],
      });
      expect(tokens[15]).toEqual({
        value: '}',
        scopes: ['source.coffee', 'meta.tag.coffee', 'meta.brace.curly.coffee'],
      });
      return expect(tokens[16]).toEqual({
        value: '>',
        scopes: ['source.coffee', 'meta.tag.coffee'],
      });
    });
  });

  return describe('firstLineMatch', function () {
    it('recognises interpreter directives', function () {
      let line;
      const valid = `\
#!/usr/sbin/coffee foo
#!/usr/bin/coffee foo=bar/
#!/usr/sbin/coffee
#!/usr/sbin/coffee foo bar baz
#!/usr/bin/coffee perl
#!/usr/bin/coffee bin/perl
#!/usr/bin/coffee
#!/bin/coffee
#!/usr/bin/coffee --script=usr/bin
#! /usr/bin/env A=003 B=149 C=150 D=xzd E=base64 F=tar G=gz H=head I=tail coffee
#!\t/usr/bin/env --foo=bar coffee --quu=quux
#! /usr/bin/coffee
#!/usr/bin/env coffee\
`;
      for (line of valid.split(/\n/)) {
        expect(
          grammar.firstLineRegex.scanner.findNextMatchSync(line)
        ).not.toBeNull();
      }

      const invalid = `\
\x20#!/usr/sbin/coffee
\t#!/usr/sbin/coffee
#!/usr/bin/env-coffee/node-env/
#!/usr/bin/env-coffee
#! /usr/bincoffee
#!\t/usr/bin/env --coffee=bar\
`;
      return (() => {
        const result = [];
        for (line of invalid.split(/\n/)) {
          result.push(
            expect(
              grammar.firstLineRegex.scanner.findNextMatchSync(line)
            ).toBeNull()
          );
        }
        return result;
      })();
    });

    it('recognises Emacs modelines', function () {
      let line;
      const valid = `\
#-*- coffee -*-
#-*- mode: Coffee -*-
/* -*-coffee-*- */
// -*- Coffee -*-
/* -*- mode:Coffee -*- */
// -*- font:bar;mode:Coffee -*-
// -*- font:bar;mode:Coffee;foo:bar; -*-
// -*-font:mode;mode:COFFEE-*-
// -*- foo:bar mode: coffee bar:baz -*-
" -*-foo:bar;mode:cOFFEE;bar:foo-*- ";
" -*-font-mode:foo;mode:coFFeE;foo-bar:quux-*-"
"-*-font:x;foo:bar; mode : Coffee; bar:foo;foooooo:baaaaar;fo:ba;-*-";
"-*- font:x;foo : bar ; mode : Coffee ; bar : foo ; foooooo:baaaaar;fo:ba-*-";\
`;
      for (line of valid.split(/\n/)) {
        expect(
          grammar.firstLineRegex.scanner.findNextMatchSync(line)
        ).not.toBeNull();
      }

      const invalid = `\
/* --*coffee-*- */
/* -*-- coffee -*-
/* -*- -- Coffee -*-
/* -*- Coffee -;- -*-
// -*- freeCoffee -*-
// -*- Coffee; -*-
// -*- coffee-sugar -*-
/* -*- model:coffee -*-
/* -*- indent-mode:coffee -*-
// -*- font:mode;Coffee -*-
// -*- mode: -*- Coffee
// -*- mode: jfc-give-me-coffee -*-
// -*-font:mode;mode:coffee--*-\
`;
      return (() => {
        const result = [];
        for (line of invalid.split(/\n/)) {
          result.push(
            expect(
              grammar.firstLineRegex.scanner.findNextMatchSync(line)
            ).toBeNull()
          );
        }
        return result;
      })();
    });

    return it('recognises Vim modelines', function () {
      let line;
      const valid = `\
vim: se filetype=coffee:
# vim: se ft=coffee:
# vim: set ft=COFFEE:
# vim: set filetype=CoffEE:
# vim: ft=CoffEE
# vim: syntax=CoffEE
# vim: se syntax=CoffEE:
# ex: syntax=CoffEE
# vim:ft=coffee
# vim600: ft=coffee
# vim>600: set ft=coffee:
# vi:noai:sw=3 ts=6 ft=coffee
# vi::::::::::noai:::::::::::: ft=COFFEE
# vim:ts=4:sts=4:sw=4:noexpandtab:ft=cOfFeE
# vi:: noai : : : : sw   =3 ts   =6 ft  =coFFEE
# vim: ts=4: pi sts=4: ft=cofFeE: noexpandtab: sw=4:
# vim: ts=4 sts=4: ft=coffee noexpandtab:
# vim:noexpandtab sts=4 ft=coffEE ts=4
# vim:noexpandtab:ft=cOFFEe
# vim:ts=4:sts=4 ft=cofFeE:noexpandtab:\x20
# vim:noexpandtab titlestring=hi\|there\\\\ ft=cOFFEe ts=4\
`;
      for (line of valid.split(/\n/)) {
        expect(
          grammar.firstLineRegex.scanner.findNextMatchSync(line)
        ).not.toBeNull();
      }

      const invalid = `\
ex: se filetype=coffee:
_vi: se filetype=coffee:
 vi: se filetype=coffee
# vim set ft=coffee
# vim: soft=coffee
# vim: clean-syntax=coffee:
# vim set ft=coffee:
# vim: setft=coffee:
# vim: se ft=coffee backupdir=tmp
# vim: set ft=coffee set cmdheight=1
# vim:noexpandtab sts:4 ft:coffee ts:4
# vim:noexpandtab titlestring=hi\\|there\\ ft=coffee ts=4
# vim:noexpandtab titlestring=hi\\|there\\\\\\ ft=coffee ts=4\
`;
      return (() => {
        const result = [];
        for (line of invalid.split(/\n/)) {
          result.push(
            expect(
              grammar.firstLineRegex.scanner.findNextMatchSync(line)
            ).toBeNull()
          );
        }
        return result;
      })();
    });
  });
});
