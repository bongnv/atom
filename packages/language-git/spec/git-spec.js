/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
describe('Git grammars', function () {
  let grammar = null;

  beforeEach(() =>
    waitsForPromise(() => atom.packages.activatePackage('language-git'))
  );

  describe('Git configs', function () {
    beforeEach(
      () => (grammar = atom.grammars.grammarForScopeName('source.git-config'))
    );

    return it('parses the Git config grammar', function () {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('source.git-config');
    });
  });

  describe('Git commit messages', function () {
    const scopeNormal = ['text.git-commit', 'meta.scope.message.git-commit'];

    const scopeLeadingLowercase = [
      'text.git-commit',
      'meta.scope.message.git-commit',
      'invalid.illegal.first-char-should-be-uppercase.git-commit',
    ];

    const scopeTrailingPeriod = [
      'text.git-commit',
      'meta.scope.message.git-commit',
      'invalid.illegal.subject-no-trailing-period.git-commit',
    ];

    const scopeLineOver50 = [
      'text.git-commit',
      'meta.scope.message.git-commit',
      'invalid.deprecated.line-too-long.git-commit',
    ];

    const scopeLineOver72 = [
      'text.git-commit',
      'meta.scope.message.git-commit',
      'invalid.illegal.line-too-long.git-commit',
    ];

    beforeEach(
      () => (grammar = atom.grammars.grammarForScopeName('text.git-commit'))
    );

    it('parses the Git commit message grammar', function () {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('text.git-commit');
    });

    it('highlights subject lines of less than 50 chars correctly', function () {
      let { tokens } = grammar.tokenizeLine(
        '123456789012345678901234567890',
        null,
        true
      );
      expect(tokens[0]).toEqual({
        value: '123456789012345678901234567890',
        scopes: scopeNormal,
      });

      ({ tokens } = grammar.tokenizeLine(
        'a23456789012345678901234567890',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'a', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '23456789012345678901234567890',
        scopes: scopeNormal,
      });

      ({ tokens } = grammar.tokenizeLine(
        '12345678901234567890123456789.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({ value: '.', scopes: scopeTrailingPeriod });

      ({ tokens } = grammar.tokenizeLine(
        'b2345678901234567890123456789.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'b', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789',
        scopes: scopeNormal,
      });
      return expect(tokens[2]).toEqual({
        value: '.',
        scopes: scopeTrailingPeriod,
      });
    });

    it('highlights subject lines of 50 chars correctly', function () {
      let { tokens } = grammar.tokenizeLine(
        '12345678901234567890123456789012345678901234567890',
        null,
        true
      );
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });

      ({ tokens } = grammar.tokenizeLine(
        'c2345678901234567890123456789012345678901234567890',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'c', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });

      ({ tokens } = grammar.tokenizeLine(
        '1234567890123456789012345678901234567890123456789.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({
        value: '1234567890123456789012345678901234567890123456789',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({ value: '.', scopes: scopeTrailingPeriod });

      ({ tokens } = grammar.tokenizeLine(
        'd234567890123456789012345678901234567890123456789.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'd', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '234567890123456789012345678901234567890123456789',
        scopes: scopeNormal,
      });
      return expect(tokens[2]).toEqual({
        value: '.',
        scopes: scopeTrailingPeriod,
      });
    });

    it('highlights subject lines of 51 chars correctly', function () {
      let { tokens } = grammar.tokenizeLine(
        '123456789012345678901234567890123456789012345678901',
        null,
        true
      );
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({ value: '1', scopes: scopeLineOver50 });

      ({ tokens } = grammar.tokenizeLine(
        'e23456789012345678901234567890123456789012345678901',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'e', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[2]).toEqual({ value: '1', scopes: scopeLineOver50 });

      ({ tokens } = grammar.tokenizeLine(
        '12345678901234567890123456789012345678901234567890.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({ value: '.', scopes: scopeTrailingPeriod });

      ({ tokens } = grammar.tokenizeLine(
        'f2345678901234567890123456789012345678901234567890.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'f', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      return expect(tokens[2]).toEqual({
        value: '.',
        scopes: scopeTrailingPeriod,
      });
    });

    it('highlights subject lines of 72 chars correctly', function () {
      let { tokens } = grammar.tokenizeLine(
        '123456789012345678901234567890123456789012345678901234567890123456789012',
        null,
        true
      );
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({
        value: '123456789012345678901',
        scopes: scopeLineOver50,
      });
      expect(tokens[2]).toEqual({ value: '2', scopes: scopeLineOver50 });

      ({ tokens } = grammar.tokenizeLine(
        'g23456789012345678901234567890123456789012345678901234567890123456789012',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'g', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[2]).toEqual({
        value: '123456789012345678901',
        scopes: scopeLineOver50,
      });
      expect(tokens[3]).toEqual({ value: '2', scopes: scopeLineOver50 });

      ({ tokens } = grammar.tokenizeLine(
        '12345678901234567890123456789012345678901234567890123456789012345678901.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({
        value: '123456789012345678901',
        scopes: scopeLineOver50,
      });
      expect(tokens[2]).toEqual({ value: '.', scopes: scopeTrailingPeriod });

      ({ tokens } = grammar.tokenizeLine(
        'h2345678901234567890123456789012345678901234567890123456789012345678901.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'h', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[2]).toEqual({
        value: '123456789012345678901',
        scopes: scopeLineOver50,
      });
      return expect(tokens[3]).toEqual({
        value: '.',
        scopes: scopeTrailingPeriod,
      });
    });

    it('highlights subject lines of 73 chars correctly', function () {
      let { tokens } = grammar.tokenizeLine(
        '1234567890123456789012345678901234567890123456789012345678901234567890123',
        null,
        true
      );
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      expect(tokens[2]).toEqual({ value: '3', scopes: scopeLineOver72 });

      ({ tokens } = grammar.tokenizeLine(
        'i234567890123456789012345678901234567890123456789012345678901234567890123',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'i', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[2]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      expect(tokens[3]).toEqual({ value: '3', scopes: scopeLineOver72 });

      ({ tokens } = grammar.tokenizeLine(
        '123456789012345678901234567890123456789012345678901234567890123456789012.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      expect(tokens[2]).toEqual({ value: '.', scopes: scopeTrailingPeriod });

      ({ tokens } = grammar.tokenizeLine(
        'j23456789012345678901234567890123456789012345678901234567890123456789012.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'j', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[2]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      return expect(tokens[3]).toEqual({
        value: '.',
        scopes: scopeTrailingPeriod,
      });
    });

    return it('highlights subject lines of over 73 chars correctly', function () {
      let { tokens } = grammar.tokenizeLine(
        '123456789012345678901234567890123456789012345678901234567890123456789012345678',
        null,
        true
      );
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      expect(tokens[2]).toEqual({ value: '345678', scopes: scopeLineOver72 });

      ({ tokens } = grammar.tokenizeLine(
        'k23456789012345678901234567890123456789012345678901234567890123456789012345678',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'k', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[2]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      expect(tokens[3]).toEqual({ value: '345678', scopes: scopeLineOver72 });

      ({ tokens } = grammar.tokenizeLine(
        '123456789012345678901234567890123456789012345678901234567890123456789012345678.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({
        value: '12345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[1]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      expect(tokens[2]).toEqual({ value: '345678', scopes: scopeLineOver72 });
      expect(tokens[3]).toEqual({ value: '.', scopes: scopeTrailingPeriod });

      ({ tokens } = grammar.tokenizeLine(
        'm23456789012345678901234567890123456789012345678901234567890123456789012345678.',
        null,
        true
      ));
      expect(tokens[0]).toEqual({ value: 'm', scopes: scopeLeadingLowercase });
      expect(tokens[1]).toEqual({
        value: '2345678901234567890123456789012345678901234567890',
        scopes: scopeNormal,
      });
      expect(tokens[2]).toEqual({
        value: '1234567890123456789012',
        scopes: scopeLineOver50,
      });
      expect(tokens[3]).toEqual({ value: '345678', scopes: scopeLineOver72 });
      return expect(tokens[4]).toEqual({
        value: '.',
        scopes: scopeTrailingPeriod,
      });
    });
  });

  return describe('Git rebases', function () {
    beforeEach(
      () => (grammar = atom.grammars.grammarForScopeName('text.git-rebase'))
    );

    it('parses the Git rebase message grammar', function () {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('text.git-rebase');
    });

    for (var cmd of [
      'pick',
      'p',
      'reword',
      'r',
      'edit',
      'e',
      'squash',
      's',
      'fixup',
      'f',
      'drop',
      'd',
    ]) {
      it(`parses the ${cmd} command`, function () {
        const { tokens } = grammar.tokenizeLine(
          `${cmd} c0ffeee This is commit message`
        );

        expect(tokens[0]).toEqual({
          value: cmd,
          scopes: [
            'text.git-rebase',
            'meta.commit-command.git-rebase',
            'support.function.git-rebase',
          ],
        });
        expect(tokens[1]).toEqual({
          value: ' ',
          scopes: ['text.git-rebase', 'meta.commit-command.git-rebase'],
        });
        expect(tokens[2]).toEqual({
          value: 'c0ffeee',
          scopes: [
            'text.git-rebase',
            'meta.commit-command.git-rebase',
            'constant.sha.git-rebase',
          ],
        });
        expect(tokens[3]).toEqual({
          value: ' ',
          scopes: ['text.git-rebase', 'meta.commit-command.git-rebase'],
        });
        return expect(tokens[4]).toEqual({
          value: 'This is commit message',
          scopes: [
            'text.git-rebase',
            'meta.commit-command.git-rebase',
            'meta.commit-message.git-rebase',
          ],
        });
      });
    }

    it('parses the exec command', function () {
      let { tokens } = grammar.tokenizeLine('exec');

      expect(tokens[0]).toEqual({
        value: 'exec',
        scopes: [
          'text.git-rebase',
          'meta.exec-command.git-rebase',
          'support.function.git-rebase',
        ],
      });

      ({ tokens } = grammar.tokenizeLine('x'));

      return expect(tokens[0]).toEqual({
        value: 'x',
        scopes: [
          'text.git-rebase',
          'meta.exec-command.git-rebase',
          'support.function.git-rebase',
        ],
      });
    });

    return it('includes language-shellscript highlighting when using the exec command', function () {
      waitsForPromise(() =>
        atom.packages.activatePackage('language-shellscript')
      );

      return runs(function () {
        const { tokens } = grammar.tokenizeLine("exec echo 'Hello World'");

        expect(tokens[0]).toEqual({
          value: 'exec',
          scopes: [
            'text.git-rebase',
            'meta.exec-command.git-rebase',
            'support.function.git-rebase',
          ],
        });
        expect(tokens[1]).toEqual({
          value: ' ',
          scopes: ['text.git-rebase', 'meta.exec-command.git-rebase'],
        });
        return expect(tokens[2]).toEqual({
          value: 'echo',
          scopes: [
            'text.git-rebase',
            'meta.exec-command.git-rebase',
            'support.function.builtin.shell',
          ],
        });
      });
    });
  });
});
