/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
describe('SQL grammar', function () {
  let grammar = null;

  beforeEach(function () {
    waitsForPromise(() => atom.packages.activatePackage('language-sql'));

    return runs(
      () => (grammar = atom.grammars.grammarForScopeName('source.sql'))
    );
  });

  it('parses the grammar', function () {
    expect(grammar).toBeDefined();
    return expect(grammar.scopeName).toBe('source.sql');
  });

  it('uses not as a keyword', function () {
    const { tokens } = grammar.tokenizeLine('NOT');
    return expect(tokens[0]).toEqual({
      value: 'NOT',
      scopes: ['source.sql', 'keyword.other.not.sql'],
    });
  });

  it('tokenizes integers', function () {
    const { tokens } = grammar.tokenizeLine('12345');
    return expect(tokens[0]).toEqual({
      value: '12345',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });
  });

  it('tokenizes integers ending words', function () {
    let { tokens } = grammar.tokenizeLine('field1');
    expect(tokens[0]).toEqual({ value: 'field1', scopes: ['source.sql'] });

    ({ tokens } = grammar.tokenizeLine('2field'));
    expect(tokens[0]).toEqual({ value: '2field', scopes: ['source.sql'] });

    ({ tokens } = grammar.tokenizeLine('link_from_1_to_2'));
    expect(tokens[0]).toEqual({
      value: 'link_from_1_to_2',
      scopes: ['source.sql'],
    });

    ({ tokens } = grammar.tokenizeLine('create table t1'));
    return expect(tokens[4]).toEqual({
      value: 't1',
      scopes: ['source.sql', 'meta.create.sql', 'entity.name.function.sql'],
    });
  });

  it('tokenizes numbers with decimals in them', function () {
    let { tokens } = grammar.tokenizeLine('123.45');
    expect(tokens[0]).toEqual({
      value: '123.45',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });

    ({ tokens } = grammar.tokenizeLine('123.'));
    expect(tokens[0]).toEqual({
      value: '123.',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });

    ({ tokens } = grammar.tokenizeLine('.123'));
    return expect(tokens[0]).toEqual({
      value: '.123',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });
  });

  it('tokenizes add', function () {
    const { tokens } = grammar.tokenizeLine('ADD CONSTRAINT');
    return expect(tokens[0]).toEqual({
      value: 'ADD',
      scopes: ['source.sql', 'meta.add.sql', 'keyword.other.create.sql'],
    });
  });

  it('tokenizes create', function () {
    const { tokens } = grammar.tokenizeLine('CREATE TABLE');
    return expect(tokens[0]).toEqual({
      value: 'CREATE',
      scopes: ['source.sql', 'meta.create.sql', 'keyword.other.create.sql'],
    });
  });

  it('does not tokenize create for non-SQL keywords', function () {
    const { tokens } = grammar.tokenizeLine('CREATE TABLEOHNO');
    return expect(tokens[0]).toEqual({
      value: 'CREATE TABLEOHNO',
      scopes: ['source.sql'],
    });
  });

  it('tokenizes create if not exists', function () {
    const { tokens } = grammar.tokenizeLine('CREATE TABLE IF NOT EXISTS t1');
    expect(tokens[0]).toEqual({
      value: 'CREATE',
      scopes: ['source.sql', 'meta.create.sql', 'keyword.other.create.sql'],
    });
    expect(tokens[2]).toEqual({
      value: 'TABLE',
      scopes: ['source.sql', 'meta.create.sql', 'keyword.other.sql'],
    });
    expect(tokens[4]).toEqual({
      value: 'IF NOT EXISTS',
      scopes: ['source.sql', 'meta.create.sql', 'keyword.other.DML.sql'],
    });
    return expect(tokens[6]).toEqual({
      value: 't1',
      scopes: ['source.sql', 'meta.create.sql', 'entity.name.function.sql'],
    });
  });

  it('tokenizes drop', function () {
    const { tokens } = grammar.tokenizeLine('DROP CONSTRAINT');
    return expect(tokens[0]).toEqual({
      value: 'DROP',
      scopes: ['source.sql', 'meta.drop.sql', 'keyword.other.drop.sql'],
    });
  });

  it('does not tokenize drop for non-SQL keywords', function () {
    const { tokens } = grammar.tokenizeLine('DROP CONSTRAINTOHNO');
    return expect(tokens[0]).toEqual({
      value: 'DROP CONSTRAINTOHNO',
      scopes: ['source.sql'],
    });
  });

  it('tokenizes drop if exists', function () {
    const { tokens } = grammar.tokenizeLine('DROP TABLE IF EXISTS t1');
    expect(tokens[0]).toEqual({
      value: 'DROP',
      scopes: ['source.sql', 'meta.drop.sql', 'keyword.other.drop.sql'],
    });
    expect(tokens[2]).toEqual({
      value: 'TABLE',
      scopes: ['source.sql', 'meta.drop.sql', 'keyword.other.sql'],
    });
    expect(tokens[4]).toEqual({
      value: 'IF EXISTS',
      scopes: ['source.sql', 'meta.drop.sql', 'keyword.other.DML.sql'],
    });
    return expect(tokens[6]).toEqual({
      value: 't1',
      scopes: ['source.sql', 'meta.drop.sql', 'entity.name.function.sql'],
    });
  });

  it('tokenizes with', function () {
    const { tokens } = grammar.tokenizeLine('WITH field');
    return expect(tokens[0]).toEqual({
      value: 'WITH',
      scopes: ['source.sql', 'keyword.other.DML.sql'],
    });
  });

  it('tokenizes conditional expressions', function () {
    let { tokens } = grammar.tokenizeLine('COALESCE(a,b)');
    expect(tokens[0]).toEqual({
      value: 'COALESCE',
      scopes: ['source.sql', 'keyword.other.conditional.sql'],
    });

    ({ tokens } = grammar.tokenizeLine('NVL(a,b)'));
    expect(tokens[0]).toEqual({
      value: 'NVL',
      scopes: ['source.sql', 'keyword.other.conditional.sql'],
    });

    ({ tokens } = grammar.tokenizeLine('NULLIF(a,b)'));
    return expect(tokens[0]).toEqual({
      value: 'NULLIF',
      scopes: ['source.sql', 'keyword.other.conditional.sql'],
    });
  });

  it('tokenizes unique', function () {
    const { tokens } = grammar.tokenizeLine('UNIQUE(id)');
    return expect(tokens[0]).toEqual({
      value: 'UNIQUE',
      scopes: ['source.sql', 'storage.modifier.sql'],
    });
  });

  it('tokenizes scalar functions', function () {
    const { tokens } = grammar.tokenizeLine('SELECT CURRENT_DATE');
    return expect(tokens[2]).toEqual({
      value: 'CURRENT_DATE',
      scopes: ['source.sql', 'support.function.scalar.sql'],
    });
  });

  it('tokenizes math functions', function () {
    const { tokens } = grammar.tokenizeLine('SELECT ABS(-4)');
    return expect(tokens[2]).toEqual({
      value: 'ABS',
      scopes: ['source.sql', 'support.function.math.sql'],
    });
  });

  it('tokenizes window functions', function () {
    const { tokens } = grammar.tokenizeLine('SELECT ROW_NUMBER()');
    return expect(tokens[2]).toEqual({
      value: 'ROW_NUMBER',
      scopes: ['source.sql', 'support.function.window.sql'],
    });
  });

  it('quotes strings', function () {
    const { tokens } = grammar.tokenizeLine('"Test"');
    expect(tokens[0]).toEqual({
      value: '"',
      scopes: [
        'source.sql',
        'string.quoted.double.sql',
        'punctuation.definition.string.begin.sql',
      ],
    });
    expect(tokens[1]).toEqual({
      value: 'Test',
      scopes: ['source.sql', 'string.quoted.double.sql'],
    });
    return expect(tokens[2]).toEqual({
      value: '"',
      scopes: [
        'source.sql',
        'string.quoted.double.sql',
        'punctuation.definition.string.end.sql',
      ],
    });
  });

  it('tokenizes storage types', function () {
    const lines = grammar.tokenizeLines(`\
datetime
double precision
integer\
`);
    expect(lines[0][0]).toEqual({
      value: 'datetime',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[1][0]).toEqual({
      value: 'double precision',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    return expect(lines[2][0]).toEqual({
      value: 'integer',
      scopes: ['source.sql', 'storage.type.sql'],
    });
  });

  it('tokenizes storage types with an optional argument', function () {
    const lines = grammar.tokenizeLines(`\
bit varying
int()
timestamptz(1)\
`);
    expect(lines[0][0]).toEqual({
      value: 'bit varying',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[1][0]).toEqual({
      value: 'int',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[1][1]).toEqual({
      value: '(',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.begin.sql',
      ],
    });
    expect(lines[1][2]).toEqual({
      value: ')',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.end.sql',
      ],
    });
    expect(lines[2][0]).toEqual({
      value: 'timestamptz',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[2][1]).toEqual({
      value: '(',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.begin.sql',
      ],
    });
    expect(lines[2][2]).toEqual({
      value: '1',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });
    return expect(lines[2][3]).toEqual({
      value: ')',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.end.sql',
      ],
    });
  });

  it('tokenizes storage types with two optional arguments', function () {
    const lines = grammar.tokenizeLines(`\
decimal
decimal(1)
numeric(1,1)\
`);
    expect(lines[0][0]).toEqual({
      value: 'decimal',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[1][0]).toEqual({
      value: 'decimal',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[1][1]).toEqual({
      value: '(',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.begin.sql',
      ],
    });
    expect(lines[1][2]).toEqual({
      value: '1',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });
    expect(lines[1][3]).toEqual({
      value: ')',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.end.sql',
      ],
    });
    expect(lines[2][0]).toEqual({
      value: 'numeric',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[2][1]).toEqual({
      value: '(',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.begin.sql',
      ],
    });
    expect(lines[2][2]).toEqual({
      value: '1',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });
    expect(lines[2][3]).toEqual({
      value: ',',
      scopes: ['source.sql', 'punctuation.separator.parameters.comma.sql'],
    });
    expect(lines[2][4]).toEqual({
      value: '1',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });
    return expect(lines[2][5]).toEqual({
      value: ')',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.end.sql',
      ],
    });
  });

  it('tokenizes storage types with time zones', function () {
    const lines = grammar.tokenizeLines(`\
time
time(1) with time zone
timestamp without time zone\
`);
    expect(lines[0][0]).toEqual({
      value: 'time',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[1][0]).toEqual({
      value: 'time',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[1][1]).toEqual({
      value: '(',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.begin.sql',
      ],
    });
    expect(lines[1][2]).toEqual({
      value: '1',
      scopes: ['source.sql', 'constant.numeric.sql'],
    });
    expect(lines[1][3]).toEqual({
      value: ')',
      scopes: [
        'source.sql',
        'punctuation.definition.parameters.bracket.round.end.sql',
      ],
    });
    expect(lines[1][5]).toEqual({
      value: 'with time zone',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    expect(lines[2][0]).toEqual({
      value: 'timestamp',
      scopes: ['source.sql', 'storage.type.sql'],
    });
    return expect(lines[2][2]).toEqual({
      value: 'without time zone',
      scopes: ['source.sql', 'storage.type.sql'],
    });
  });

  it('tokenizes comments', function () {
    let { tokens } = grammar.tokenizeLine('-- comment');
    expect(tokens[0]).toEqual({
      value: '--',
      scopes: [
        'source.sql',
        'comment.line.double-dash.sql',
        'punctuation.definition.comment.sql',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' comment',
      scopes: ['source.sql', 'comment.line.double-dash.sql'],
    });

    ({ tokens } = grammar.tokenizeLine('AND -- WITH'));

    expect(tokens[0]).toEqual({
      value: 'AND',
      scopes: ['source.sql', 'keyword.other.DML.sql'],
    });
    expect(tokens[2]).toEqual({
      value: '--',
      scopes: [
        'source.sql',
        'comment.line.double-dash.sql',
        'punctuation.definition.comment.sql',
      ],
    });
    expect(tokens[3]).toEqual({
      value: ' WITH',
      scopes: ['source.sql', 'comment.line.double-dash.sql'],
    });

    ({ tokens } = grammar.tokenizeLine('/* comment */'));
    expect(tokens[0]).toEqual({
      value: '/*',
      scopes: [
        'source.sql',
        'comment.block.sql',
        'punctuation.definition.comment.sql',
      ],
    });
    expect(tokens[1]).toEqual({
      value: ' comment ',
      scopes: ['source.sql', 'comment.block.sql'],
    });
    expect(tokens[2]).toEqual({
      value: '*/',
      scopes: [
        'source.sql',
        'comment.block.sql',
        'punctuation.definition.comment.sql',
      ],
    });

    ({ tokens } = grammar.tokenizeLine('SELECT /* WITH */ AND'));
    expect(tokens[0]).toEqual({
      value: 'SELECT',
      scopes: ['source.sql', 'keyword.other.DML.sql'],
    });
    expect(tokens[2]).toEqual({
      value: '/*',
      scopes: [
        'source.sql',
        'comment.block.sql',
        'punctuation.definition.comment.sql',
      ],
    });
    expect(tokens[3]).toEqual({
      value: ' WITH ',
      scopes: ['source.sql', 'comment.block.sql'],
    });
    expect(tokens[4]).toEqual({
      value: '*/',
      scopes: [
        'source.sql',
        'comment.block.sql',
        'punctuation.definition.comment.sql',
      ],
    });
    return expect(tokens[6]).toEqual({
      value: 'AND',
      scopes: ['source.sql', 'keyword.other.DML.sql'],
    });
  });

  return describe('punctuation', function () {
    it('tokenizes parentheses', function () {
      const { tokens } = grammar.tokenizeLine(
        'WHERE salary > (SELECT avg(salary) FROM employees)'
      );
      expect(tokens[0]).toEqual({
        value: 'WHERE',
        scopes: ['source.sql', 'keyword.other.DML.sql'],
      });
      expect(tokens[1]).toEqual({ value: ' salary ', scopes: ['source.sql'] });
      expect(tokens[2]).toEqual({
        value: '>',
        scopes: ['source.sql', 'keyword.operator.comparison.sql'],
      });
      expect(tokens[4]).toEqual({
        value: '(',
        scopes: [
          'source.sql',
          'punctuation.definition.section.bracket.round.begin.sql',
        ],
      });
      expect(tokens[5]).toEqual({
        value: 'SELECT',
        scopes: ['source.sql', 'keyword.other.DML.sql'],
      });
      expect(tokens[7]).toEqual({
        value: 'avg',
        scopes: ['source.sql', 'support.function.aggregate.sql'],
      });
      expect(tokens[8]).toEqual({
        value: '(',
        scopes: [
          'source.sql',
          'punctuation.definition.section.bracket.round.begin.sql',
        ],
      });
      expect(tokens[9]).toEqual({ value: 'salary', scopes: ['source.sql'] });
      expect(tokens[10]).toEqual({
        value: ')',
        scopes: [
          'source.sql',
          'punctuation.definition.section.bracket.round.end.sql',
        ],
      });
      expect(tokens[12]).toEqual({
        value: 'FROM',
        scopes: ['source.sql', 'keyword.other.DML.sql'],
      });
      expect(tokens[13]).toEqual({
        value: ' employees',
        scopes: ['source.sql'],
      });
      return expect(tokens[14]).toEqual({
        value: ')',
        scopes: [
          'source.sql',
          'punctuation.definition.section.bracket.round.end.sql',
        ],
      });
    });

    it('tokenizes commas', function () {
      const { tokens } = grammar.tokenizeLine('name, year');
      expect(tokens[0]).toEqual({ value: 'name', scopes: ['source.sql'] });
      expect(tokens[1]).toEqual({
        value: ',',
        scopes: ['source.sql', 'punctuation.separator.comma.sql'],
      });
      return expect(tokens[2]).toEqual({
        value: ' year',
        scopes: ['source.sql'],
      });
    });

    it('tokenizes periods', function () {
      let { tokens } = grammar.tokenizeLine('.');
      expect(tokens[0]).toEqual({
        value: '.',
        scopes: ['source.sql', 'punctuation.separator.period.sql'],
      });

      ({ tokens } = grammar.tokenizeLine('database.table'));
      expect(tokens[0]).toEqual({
        value: 'database',
        scopes: ['source.sql', 'constant.other.database-name.sql'],
      });
      expect(tokens[1]).toEqual({
        value: '.',
        scopes: ['source.sql', 'punctuation.separator.period.sql'],
      });
      return expect(tokens[2]).toEqual({
        value: 'table',
        scopes: ['source.sql', 'constant.other.table-name.sql'],
      });
    });

    return it('tokenizes semicolons', function () {
      const { tokens } = grammar.tokenizeLine('ORDER BY year;');
      expect(tokens[0]).toEqual({
        value: 'ORDER BY',
        scopes: ['source.sql', 'keyword.other.DML.sql'],
      });
      expect(tokens[1]).toEqual({ value: ' year', scopes: ['source.sql'] });
      return expect(tokens[2]).toEqual({
        value: ';',
        scopes: [
          'source.sql',
          'punctuation.terminator.statement.semicolon.sql',
        ],
      });
    });
  });
});
