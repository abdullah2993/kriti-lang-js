import { Lexer, Tokenizer } from './lexer';
import {
	ArrayNode, BooleanNode, IfNode, NullNode, NumberNode, ObjectNode, PathNode, PropertyNode, RangeNode, StringNode, TNode,
} from './ast';
import { Token, TokenType } from './token';

export class Parser {
	private currentToken!: Token;

	private peekToken!: Token;

	constructor(private lexer: Tokenizer) {
		this.next();
	}

	parse():TNode {
		const token = this.next();
		if (token.type === 'EOF') {
			return undefined;
		}

		switch (token.type) {
			case TokenType.LeftBrace:
				return this.parseObject();

			case TokenType.LeftBracket:
				return this.parseArray();

			case TokenType.String:
				return this.parseString(token.value);

			case TokenType.Number:
				return this.parseNumber(token.value);

			case TokenType.True:
				return this.parseBoolean(true);

			case TokenType.False:
				return this.parseBoolean(false);

			case TokenType.Null:
				return this.parseNull();

			case TokenType.LeftParen:
				return this.parseEnclosedTemplate();

			case TokenType.TemplateStart:
				return this.parseTemplate();

			default:
				throw new Error(`Unexpected token ${token.type}`);
		}
	}

	private parseTemplate(): TNode {
		switch (this.peekToken.type) {
			case TokenType.Range:
				return this.parseRange();
			case TokenType.If:
				return this.parseIf();
			case TokenType.Identifier:
			default:
				return this.parseTemplateContent();
		}
	}

	private parseTemplateContent(): NullNode {
		this.consumePeekTokenIf(TokenType.Identifier);
		return new NullNode();
	}

	private parseEnclosedTemplate(): TNode {
		this.consumePeekTokenIf(TokenType.TemplateStart);
		const node = this.parse();
		this.assertPeekToken(TokenType.RightParen);
		return node;
	}

	private parseRange(): RangeNode {
		this.consumePeekTokenIf(TokenType.Range);
		const indexIdent = this.consumeCurrentTokenIf(TokenType.Identifier);
		this.consumeCurrentTokenIf(TokenType.Comma);
		const valueIdent = this.consumeCurrentTokenIf(TokenType.Identifier);
		this.consumeCurrentTokenIf(TokenType.Assign);
		const path = this.parsePath();
		this.consumeCurrentTokenIf(TokenType.TemplateEnd);
		const body = this.parse();
		this.consumeCurrentTokenIf(TokenType.TemplateStart);
		this.consumeCurrentTokenIf(TokenType.End);
		this.consumeCurrentTokenIf(TokenType.TemplateEnd);
		this.next();
		return new RangeNode(indexIdent.value, valueIdent.value, path, body!);
	}

	private parseIf(): IfNode {
		this.consumeCurrentTokenIf(TokenType.If);
		const cond = this.parseTemplate();
		this.consumeCurrentTokenIf(TokenType.TemplateEnd);
		const then = this.parse();
		this.consumeCurrentTokenIf(TokenType.TemplateStart);
		let elseBody: TNode;
		if (this.currentToken.type === TokenType.Else) {
			this.consumeCurrentTokenIf(TokenType.Else);
			this.consumeCurrentTokenIf(TokenType.TemplateEnd);
			elseBody = this.parse();
		}
		this.consumeCurrentTokenIf(TokenType.TemplateStart);
		this.consumeCurrentTokenIf(TokenType.End);
		this.consumeCurrentTokenIf(TokenType.TemplateEnd);
		return new IfNode(cond, then, elseBody);
	}

	private parsePath(): PathNode {
		const node = new PathNode('');
		// while (true) {
		// 	const token = this.next();
		// 	if (token.type === TokenType.Identifier) {
		// 		node.path.push(token.value);
		// 	}
		// 	if (token.type === TokenType.Dot) {
		// 		continue;
		// 	}
		// 	this.assertPeekToken(TokenType.Identifier);
		// 	break;
		// }
		return node;
	}

	private parseObject(): ObjectNode {
		const node = new ObjectNode();
		while (true) {
			const keyToken = this.next();
			if (keyToken.type === TokenType.RightBrace) {
				break;
			}

			if (keyToken.type !== TokenType.String) {
				throw new Error(`Expected string got ${keyToken.type}`);
			}

			this.consumePeekTokenIf(TokenType.Colon);

			const value = this.parse();
			if (value === undefined) {
				throw new Error('Expected value');
			}

			node.value.push(new PropertyNode(keyToken.value, value));

			if (this.peekToken.type === TokenType.Comma) {
				this.next();
				continue;
			}

			this.assertPeekToken(TokenType.RightBrace);
		}

		return node;
	}

	private parseArray(): ArrayNode {
		const node = new ArrayNode();
		while (true) {
			if (this.peekToken.type === TokenType.RightBracket) {
				this.next();
				break;
			}

			const value = this.parse();
			if (value === undefined) {
				throw new Error('Expected value');
			}

			node.value.push(value);

			if (this.peekToken.type === TokenType.Comma) {
				this.next();
				continue;
			}

			this.assertPeekToken(TokenType.RightBracket);
		}

		return node;
	}

	private parseString(value: string): StringNode {
		return new StringNode(value);
	}

	private parseNumber(value: string): NumberNode {
		return new NumberNode(Number(value));
	}

	private parseBoolean(value: boolean): BooleanNode {
		return new BooleanNode(value);
	}

	private parseNull(): NullNode {
		return new NullNode();
	}

	private next(): Token {
		this.currentToken = this.peekToken;
		this.peekToken = this.lexer.next();
		return this.currentToken;
	}

	private assertPeekToken(token: TokenType): void {
		if (this.peekToken.type !== token) {
			throw new Error(`Expected ${token} got ${this.peekToken.type}`);
		}
	}

	private consumePeekTokenIf(token: TokenType): Token {
		this.assertPeekToken(token);
		return this.next();
	}

	private assertCurrentToken(token: TokenType): void {
		if (this.currentToken.type !== token) {
			throw new Error(`Expected ${token} got ${this.currentToken.type}`);
		}
	}

	private consumeCurrentTokenIf(token: TokenType): Token {
		this.assertCurrentToken(token);
		return this.next();
	}

	public static parse(source: string): TNode {
		const lexer = new Lexer(source);
		const parser = new Parser(lexer);
		return parser.parse();
	}
}
