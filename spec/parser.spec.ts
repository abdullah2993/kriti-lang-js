import { ArrayNode, ObjectNode, StringNode } from '../src/ast';
import { Parser } from '../src/parser';

describe('Parser Tests', () => {
	it('should parse simple value json', () => {
		const json = '{"key": "value"}';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('Object');
	});

	it('should parse simple string value json', () => {
		const json = '"hello"';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('String');
		expect((node as any).value).toBe('hello');
	});

	it('should parse simple number value json', () => {
		const json = '1234';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('Number');
		expect((node as any).value).toBe(1234);
	});

	it('should parse simple true value json', () => {
		const json = 'true';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('Boolean');
		expect((node as any).value).toBe(true);
	});

	it('should parse simple false value json', () => {
		const json = 'false';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('Boolean');
		expect((node as any).value).toBe(false);
	});
	it('should parse simple null value json', () => {
		const json = 'null';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('Null');
	});
	it('should parse array', () => {
		const json = '[1,2,3]';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('Array');
		expect((node as any).value.length).toBe(3);
	});
	it('should parse json with multiple properties', () => {
		const json = '{"key": "value", "key2": "value2", "key3": [1,2,3]}';
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node!.type).toBe('Object');
		expect((node as any).value.length).toBe(3);
		if (node instanceof ObjectNode) {
			expect(node.value[0].key).toBe('key');
			expect(node.value[0].value.type).toBe('String');
			expect((node.value[0].value as StringNode).value).toBe('value');

			expect(node.value[1].key).toBe('key2');
			expect(node.value[1].value.type).toBe('String');
			expect((node.value[1].value as StringNode).value).toBe('value2');

			expect(node.value[2].key).toBe('key3');
			expect(node.value[2].value.type).toBe('Array');
			expect((node.value[2].value as ArrayNode).value.length).toBe(3);
		}
	});
	it('should parse complex json', () => {
		const json = `[
		null,
		true,
		false,
		1,
		1.5,
		"hello",
		"hello123",
		[1, null, true],
		{"foo": 1},
		{"foo": 1, "bar": { "baz": [1, true]}},
		{
			"event": {
			"name": "Freddie Jones",
			"age": 27,
			"author": {
				"articles": [
					{ "id": 0, "title": "The Elements", "length": 150, "published": true},
					{ "id": 1, "title": "ARRL Handbook", "length": 1000, "published": true},
					{ "id": 2, "title": "The Mars Trilogy", "length": 500, "published": false}
				]
			}
		}
		}]`;
		const node = Parser.parse(json);
		expect(node).toBeDefined();
		expect(node.type).toBe('Array');
	});
});
