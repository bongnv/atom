/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
describe('Mustache grammar', function () {
  let grammar = null;

  beforeEach(function () {
    waitsForPromise(() => atom.packages.activatePackage('language-html'));

    waitsForPromise(() => atom.packages.activatePackage('language-mustache'));

    return runs(
      () => (grammar = atom.grammars.grammarForScopeName('text.html.mustache'))
    );
  });

  it('parses the grammar', function () {
    expect(grammar).toBeTruthy();
    return expect(grammar.scopeName).toBe('text.html.mustache');
  });

  it('parses expressions', function () {
    const { tokens } = grammar.tokenizeLine('{{name}}');

    expect(tokens[0]).toEqual({
      value: '{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: 'name',
      scopes: ['text.html.mustache', 'meta.tag.template.mustache'],
    });
    return expect(tokens[2]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
  });

  it('parses expressions in HTML attributes', function () {
    const { tokens } = grammar.tokenizeLine("<a href='{{test}}'></a>");

    expect(tokens[6]).toEqual({
      value: '{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.inline.a.html',
        'meta.attribute-with-value.html',
        'string.quoted.single.html',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[8]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.inline.a.html',
        'meta.attribute-with-value.html',
        'string.quoted.single.html',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    return expect(tokens[9]).toEqual({
      value: "'",
      scopes: [
        'text.html.mustache',
        'meta.tag.inline.a.html',
        'meta.attribute-with-value.html',
        'string.quoted.single.html',
        'punctuation.definition.string.end.html',
      ],
    });
  });

  it('parses block comments', function () {
    const { tokens } = grammar.tokenizeLine('{{!--{{comment}}--}}');

    expect(tokens[0]).toEqual({
      value: '{{!--',
      scopes: [
        'text.html.mustache',
        'comment.block.mustache',
        'punctuation.definition.comment.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: '{{comment}}',
      scopes: ['text.html.mustache', 'comment.block.mustache'],
    });
    return expect(tokens[2]).toEqual({
      value: '--}}',
      scopes: [
        'text.html.mustache',
        'comment.block.mustache',
        'punctuation.definition.comment.mustache',
      ],
    });
  });

  it('parses comments', function () {
    const { tokens } = grammar.tokenizeLine('{{!comment}}');

    expect(tokens[0]).toEqual({
      value: '{{!',
      scopes: [
        'text.html.mustache',
        'comment.block.mustache',
        'punctuation.definition.comment.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: 'comment',
      scopes: ['text.html.mustache', 'comment.block.mustache'],
    });
    return expect(tokens[2]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'comment.block.mustache',
        'punctuation.definition.comment.mustache',
      ],
    });
  });

  it('parses block expression', function () {
    let { tokens } = grammar.tokenizeLine('{{#each people}}');

    expect(tokens[0]).toEqual({
      value: '{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: '#',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'punctuation.definition.block.begin.mustache',
      ],
    });
    expect(tokens[2]).toEqual({
      value: 'each',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'entity.name.function.mustache',
      ],
    });
    expect(tokens[3]).toEqual({
      value: ' people',
      scopes: ['text.html.mustache', 'meta.tag.template.mustache'],
    });
    expect(tokens[4]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('{{# nested.block }}'));

    expect(tokens[0]).toEqual({
      value: '{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: '#',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'punctuation.definition.block.begin.mustache',
      ],
    });
    expect(tokens[3]).toEqual({
      value: 'nested.block',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'entity.name.function.mustache',
      ],
    });
    expect(tokens[5]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('{{^repo}}'));

    expect(tokens[0]).toEqual({
      value: '{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: '^',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'punctuation.definition.block.begin.mustache',
      ],
    });
    expect(tokens[2]).toEqual({
      value: 'repo',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'entity.name.function.mustache',
      ],
    });
    expect(tokens[3]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('{{/if}}'));

    expect(tokens[0]).toEqual({
      value: '{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: '/',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'punctuation.definition.block.end.mustache',
      ],
    });
    expect(tokens[2]).toEqual({
      value: 'if',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
        'entity.name.function.mustache',
      ],
    });
    return expect(tokens[3]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
  });

  it('parses unescaped expressions', function () {
    const { tokens } = grammar.tokenizeLine('{{{do not escape me}}}');

    expect(tokens[0]).toEqual({
      value: '{{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.raw.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: 'do not escape me',
      scopes: ['text.html.mustache', 'meta.tag.template.raw.mustache'],
    });
    return expect(tokens[2]).toEqual({
      value: '}}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.raw.mustache',
        'entity.name.tag.mustache',
      ],
    });
  });

  it('does not tokenize tags within tags', function () {
    const { tokens } = grammar.tokenizeLine('{{test{{test}}}}');

    expect(tokens[0]).toEqual({
      value: '{{',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: 'test{{test',
      scopes: ['text.html.mustache', 'meta.tag.template.mustache'],
    });
    expect(tokens[2]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'meta.tag.template.mustache',
        'entity.name.tag.mustache',
      ],
    });
    return expect(tokens[3]).toEqual({
      value: '}}',
      scopes: ['text.html.mustache'],
    });
  });

  it('does not tokenize comments within comments', function () {
    const { tokens } = grammar.tokenizeLine('{{!test{{!test}}}}');

    expect(tokens[0]).toEqual({
      value: '{{!',
      scopes: [
        'text.html.mustache',
        'comment.block.mustache',
        'punctuation.definition.comment.mustache',
      ],
    });
    expect(tokens[1]).toEqual({
      value: 'test{{!test',
      scopes: ['text.html.mustache', 'comment.block.mustache'],
    });
    expect(tokens[2]).toEqual({
      value: '}}',
      scopes: [
        'text.html.mustache',
        'comment.block.mustache',
        'punctuation.definition.comment.mustache',
      ],
    });
    return expect(tokens[3]).toEqual({
      value: '}}',
      scopes: ['text.html.mustache'],
    });
  });

  return it('does not tokenize Mustache expressions inside HTML comments', function () {
    const { tokens } = grammar.tokenizeLine('<!--{{test}}-->');

    expect(tokens[0]).toEqual({
      value: '<!--',
      scopes: [
        'text.html.mustache',
        'comment.block.html',
        'punctuation.definition.comment.html',
      ],
    });
    expect(tokens[1]).toEqual({
      value: '{{test}}',
      scopes: ['text.html.mustache', 'comment.block.html'],
    });
    return expect(tokens[2]).toEqual({
      value: '-->',
      scopes: [
        'text.html.mustache',
        'comment.block.html',
        'punctuation.definition.comment.html',
      ],
    });
  });
});
