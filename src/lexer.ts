import { Token, TokenType } from './token';

export interface Tokenizer {
	next(): Token;
}

enum LexerMode{
	Normal,
	String,
	Expr,
}

export class Lexer implements Tokenizer {
	private mode: LexerMode = LexerMode.Normal;

	private position: number = 0;

	private line: number = 1;

	private column: number = 1;

	private get currentChar(): string {
		return this.source[this.position] ?? '\0';
	}

	private get nextChar(): string {
		return this.source[this.position + 1] ?? '\0';
	}

	private get currentCharCode(): number {
		return this.currentChar.charCodeAt(0);
	}

	private get nextCharCode(): number {
		return this.nextChar.charCodeAt(0);
	}

	constructor(private source: string) {

	}

	next(): Token {
		let token: Token;

		this.skipWhitespace();

		switch (this.currentChar) {
			case '\0':
				token = this.newToken(TokenType.EOF, '\0');
				break;
			case '(':
				token = this.newToken(TokenType.LeftParen);
				break;
			case ')':
				token = this.newToken(TokenType.RightParen);
				break;
			case '{':
				if (this.nextChar === '{') {
					this.advance();
					this.mode = LexerMode.Expr;
					token = this.newToken(TokenType.TemplateStart);
				} else {
					token = this.newToken(TokenType.LeftBrace);
				}
				break;
			case '}':
				if (this.mode === LexerMode.Expr && this.nextChar === '}') {
					this.advance();
					this.mode = LexerMode.Normal;
					token = this.newToken(TokenType.TemplateEnd);
				} else {
					token = this.newToken(TokenType.RightBrace);
				}
				break;
			case '[':
				token = this.newToken(TokenType.LeftBracket);
				break;
			case ']':
				token = this.newToken(TokenType.RightBracket);
				break;
			case ',':
				token = this.newToken(TokenType.Comma);
				break;
			case '.':
				token = this.newToken(TokenType.Dot);
				break;
			case ':':
				if (this.nextChar === '=') {
					this.advance();
					token = this.newToken(TokenType.Assign);
				} else {
					token = this.newToken(TokenType.Colon);
				}
				break;
			case '=':
				if (this.nextChar === '=') {
					this.advance();
					token = this.newToken(TokenType.Eq);
				} else {
					token = this.newToken(TokenType.Illegal, '=');
				}
				break;
			case '!':
				if (this.nextChar === '=') {
					this.advance();
					token = this.newToken(TokenType.Neq);
				} else {
					token = this.newToken(TokenType.Illegal, '!');
				}
				break;
			case '<':
				if (this.nextChar === '=') {
					this.advance();
					token = this.newToken(TokenType.Lte);
				} else {
					token = this.newToken(TokenType.Lt);
				}
				break;
			case '>':
				if (this.nextChar === '=') {
					this.advance();
					token = this.newToken(TokenType.Gte);
				} else {
					token = this.newToken(TokenType.Gt);
				}
				break;
			case '$':
				token = this.newToken(TokenType.Dollar);
				break;
			case '?':
				if (this.nextChar === '?') {
					this.advance();
					token = this.newToken(TokenType.Coalesce);
				} else {
					token = this.newToken(TokenType.QuestionMark);
				}
				break;
			case '&':
				if (this.nextChar === '&') {
					this.advance();
					token = this.newToken(TokenType.And);
				} else {
					token = this.newToken(TokenType.Illegal, '&');
				}
				break;
			case '|':
				if (this.nextChar === '|') {
					this.advance();
					token = this.newToken(TokenType.Or);
				} else {
					token = this.newToken(TokenType.Illegal, '|');
				}
				break;
			case "'":
			case '"':
				token = this.newToken(TokenType.String, this.readString());
				break;
			default:
				if (Lexer.isLetter(this.currentCharCode)) {
					const ident = this.readIdentifier();
					const tokenType = Lexer.resolveIdentifier(ident);
					token = this.newToken(tokenType, tokenType === TokenType.Identifier ? ident : undefined);
					break;
				} else if (Lexer.isNumber(this.currentCharCode) || this.currentChar === '-') {
					token = this.newToken(TokenType.Number, this.readNumber());
					break;
				} else {
					token = this.newToken(TokenType.Illegal, this.currentChar);
				}
		}
		this.advance();
		return token;
	}

	private advance(): void {
		this.position++;
		this.column++;
	}

	private advanceNewline(): void {
		this.advance();
		this.line++;
		this.column = 1;
	}

	private skipWhitespace(): void {
		while (this.currentCharCode) {
			if (this.currentChar === '\r') {
				if (this.nextChar === '\n') {
					this.advance();
				}
				this.advanceNewline();
			} else if (this.currentChar === '\n') {
				this.advanceNewline();
			} else if (this.currentChar === ' ' || this.currentChar === '\t') {
				this.advance();
			} else {
				break;
			}
		}
	}

	private readString(): string {
		const start = this.position + 1;
		const quote = this.currentChar;
		this.advance();
		while (this.currentCharCode) {
			// added "as any" to trick typescript type narrowing
			if (this.currentChar === '\\' as any) {
				this.advance();
				switch (this.currentChar) {
					case '"':
					case '\\':
					case '/':
					case 'b':
					case 'f':
					case 'n':
					case 'r':
					case 't':
						this.advance();
						break;
					case 'u':
						this.advance();
						for (let i = 0; i < 4; i++) {
							if (!Lexer.isHexDigit(this.currentCharCode)) {
								throw new Error('Invalid unicode escape sequence');
							}
							this.advance();
						}
						break;
					default:
						throw new Error('Invalid escape sequence');
				}
			}
			if (this.currentChar === quote) {
				break;
			}
			this.advance();
		}
		return this.source.substring(start, this.position);
	}

	private static isHexDigit(charCode: number): boolean {
		return (charCode >= 0x30 && charCode <= 0x39) || (charCode >= 0x41 && charCode <= 0x46) || (charCode >= 0x61 && charCode <= 0x66);
	}

	private readNumber(): string {
		const start = this.position;
		if (this.currentChar === '-') {
			this.advance();
		}

		// eslint-disable-next-line no-empty
		if (this.currentChar === '0') {

		} else if (Lexer.isNumber(this.currentCharCode)) {
			while (Lexer.isNumber(this.nextCharCode)) {
				this.advance();
			}
		} else {
			throw new Error('Invalid number');
		}

		if (this.nextChar === '.') {
			this.advance();
			while (Lexer.isNumber(this.nextCharCode)) {
				this.advance();
			}
		}

		// added "as any" to trick typescript type narrowing
		if (this.nextChar === 'e' || this.nextChar === 'E' as any) {
			this.advance();
			if (this.nextChar === '+' || this.nextChar === '-') {
				this.advance();
			}
			while (Lexer.isNumber(this.nextCharCode)) {
				this.advance();
			}
		}

		return this.source.substring(start, this.position + 1);
	}

	private readIdentifier(): string {
		const start = this.position;
		while (Lexer.isLetter(this.nextCharCode)) {
			this.advance();
		}
		return this.source.substring(start, this.position + 1);
	}

	private newToken(type: TokenType, value?: string): Token {
		return new Token(type, value ?? type, this.line, this.column - (value ?? type).length, this.position);
	}

	private static isNumber(charCode: number): boolean {
		return charCode >= 0x30 && charCode <= 0x39; // '0'-'9'
	}

	private static isLetter(charCode: number): boolean {
		return (
			(charCode >= 0x41 && charCode <= 0x5a) // A-Z
			|| (charCode >= 0x61 && charCode <= 0x7a) // a-z
			|| charCode === 0x5f // '_'
		);
	}

	private static keywords: { [key: string]: TokenType } = {
		if: TokenType.If,
		else: TokenType.Else,
		end: TokenType.End,
		range: TokenType.Range,
		null: TokenType.Null,
		true: TokenType.True,
		false: TokenType.False,
	};

	private static resolveIdentifier(identifier: string): TokenType {
		const tokenType = Lexer.keywords[identifier.toLowerCase()];
		return tokenType ?? TokenType.Identifier;
	}
}
