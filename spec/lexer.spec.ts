import { Lexer } from '../src/lexer';
import { TokenType } from '../src/token';

describe('lexer', () => {
	it('should parse string', () => {
		const lexer = new Lexer('"hello"');
		const token = lexer.next();
		expect(token.type).toBe(TokenType.String);
		expect(token.value).toBe('hello');
		expect(lexer.next().type).toBe(TokenType.EOF);
	});
	it('should parse identifier', () => {
		const lexer = new Lexer('hello');
		const token = lexer.next();
		expect(token.type).toBe(TokenType.Identifier);
		expect(token.value).toBe('hello');
		expect(lexer.next().type).toBe(TokenType.EOF);
	});
	it('should parse number', () => {
		const lexer = new Lexer('1234');
		const token = lexer.next();
		expect(token.type).toBe(TokenType.Number);
		expect(token.value).toBe('1234');
		expect(lexer.next().type).toBe(TokenType.EOF);
	});
	it('should parse if', () => {
		const lexer = new Lexer('if');
		const token = lexer.next();
		expect(token.type).toBe(TokenType.If);
		expect(token.value).toBe('if');
		expect(lexer.next().type).toBe(TokenType.EOF);
	});
	it('should lex array', () => {
		const lexer = new Lexer('[1,2,3]');
		const expected = [
			{ type: TokenType.LeftBracket, value: '[' },
			{ type: TokenType.Number, value: '1' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.Number, value: '2' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.Number, value: '3' },
			{ type: TokenType.RightBracket, value: ']' },
			{ type: TokenType.EOF, value: '\0' },
		];
		expected.forEach(({ type, value }) => {
			const token = lexer.next();
			expect(token.type).toBe(type);
			expect(token.value).toBe(value);
		});
	});

	it('should lex object with multiple properties and array as proper json', () => {
		const lexer = new Lexer('{"key": "value", "keyx": "value2", "keyy": [1,2,3]}');
		const expected = [
			{ type: TokenType.LeftBrace, value: '{' },
			{ type: TokenType.String, value: 'key' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.String, value: 'value' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.String, value: 'keyx' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.String, value: 'value2' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.String, value: 'keyy' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.LeftBracket, value: '[' },
			{ type: TokenType.Number, value: '1' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.Number, value: '2' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.Number, value: '3' },
			{ type: TokenType.RightBracket, value: ']' },
			{ type: TokenType.RightBrace, value: '}' },
			{ type: TokenType.EOF, value: '\0' },
		];
		expected.forEach((token) => {
			const actual = lexer.next();
			expect(actual.type).toBe(token.type);
			expect(actual.value).toBe(token.value);
		});
	});
	it('should lex the provided input correctly', () => {
		const input = `{{ range i, x := $.results }}
				{
					"id": {{i}},
					"fullName": {{concatName x.name}},
					"profile": {
						"gender": {{getG x.gender}},
						"emailID": {{x.email}},
						"isSuperUser": {{isAdmin x.login.username}}
					}
				}
			{{ end }}`;

		const lexer = new Lexer(input);
		const expected = [
			{ type: TokenType.TemplateStart, value: '{{' },
			{ type: TokenType.Range, value: 'range' },
			{ type: TokenType.Identifier, value: 'i' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.Identifier, value: 'x' },
			{ type: TokenType.Assign, value: ':=' },
			{ type: TokenType.Dollar, value: '$' },
			{ type: TokenType.Dot, value: '.' },
			{ type: TokenType.Identifier, value: 'results' },
			{ type: TokenType.TemplateEnd, value: '}}' },
			{ type: TokenType.LeftBrace, value: '{' },
			{ type: TokenType.String, value: 'id' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.TemplateStart, value: '{{' },
			{ type: TokenType.Identifier, value: 'i' },
			{ type: TokenType.TemplateEnd, value: '}}' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.String, value: 'fullName' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.TemplateStart, value: '{{' },
			{ type: TokenType.Identifier, value: 'concatName' },
			{ type: TokenType.Identifier, value: 'x' },
			{ type: TokenType.Dot, value: '.' },
			{ type: TokenType.Identifier, value: 'name' },
			{ type: TokenType.TemplateEnd, value: '}}' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.String, value: 'profile' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.LeftBrace, value: '{' },
			{ type: TokenType.String, value: 'gender' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.TemplateStart, value: '{{' },
			{ type: TokenType.Identifier, value: 'getG' },
			{ type: TokenType.Identifier, value: 'x' },
			{ type: TokenType.Dot, value: '.' },
			{ type: TokenType.Identifier, value: 'gender' },
			{ type: TokenType.TemplateEnd, value: '}}' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.String, value: 'emailID' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.TemplateStart, value: '{{' },
			{ type: TokenType.Identifier, value: 'x' },
			{ type: TokenType.Dot, value: '.' },
			{ type: TokenType.Identifier, value: 'email' },
			{ type: TokenType.TemplateEnd, value: '}}' },
			{ type: TokenType.Comma, value: ',' },
			{ type: TokenType.String, value: 'isSuperUser' },
			{ type: TokenType.Colon, value: ':' },
			{ type: TokenType.TemplateStart, value: '{{' },
			{ type: TokenType.Identifier, value: 'isAdmin' },
			{ type: TokenType.Identifier, value: 'x' },
			{ type: TokenType.Dot, value: '.' },
			{ type: TokenType.Identifier, value: 'login' },
			{ type: TokenType.Dot, value: '.' },
			{ type: TokenType.Identifier, value: 'username' },
			{ type: TokenType.TemplateEnd, value: '}}' },
			{ type: TokenType.RightBrace, value: '}' },
			{ type: TokenType.RightBrace, value: '}' },
			{ type: TokenType.TemplateStart, value: '{{' },
			{ type: TokenType.End, value: 'end' },
			{ type: TokenType.TemplateEnd, value: '}}' },
			{ type: TokenType.EOF, value: '\0' },
		];

		expected.forEach((token) => {
			const actual = lexer.next();
			expect(actual.type).toBe(token.type);
			expect(actual.value).toBe(token.value);
		});
	});
});
