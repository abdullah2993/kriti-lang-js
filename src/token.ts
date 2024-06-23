export enum TokenType {
	Illegal = 'ILLEGAL',
	EOF = 'EOF',

	Identifier = 'IDENT',
	Number = 'NUMBER',
	String = 'STRING',

	True = 'true',
	False = 'false',

	Quote = '"',

	LeftParen = '(',
	RightParen = ')',
	LeftBrace = '{',
	RightBrace = '}',
	LeftBracket = '[',
	RightBracket = ']',
	Comma = ',',
	Dot = '.',
	Colon = ':',
	Eq = '==',
	Neq = '!=',
	Gt = '>',
	Lt = '<',
	Gte = '>=',
	Lte = '<=',
	Dollar = '$',
	QuestionMark = '?',
	Coalesce = '??',
	SingleQuote = "'",
	TemplateStart = '{{',
	TemplateEnd = '}}',
	And = '&&',
	Or = '||',
	Assign = ':=',

	End = 'end',
	Range = 'range',
	If = 'if',
	Else = 'else',
	Null = 'null',
}

export class Token {
	constructor(
		public type: TokenType,
		public value: string,
		public line: number,
		public column: number,
		public position: number,
	) { }

	public toString(): string {
		return `${this.type} ${this.value}`;
	}
}
