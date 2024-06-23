import { TNode } from './ast';
import { Parser } from './parser';

export function eval1(node: TNode): any {
	switch (node.type) {
		case 'Object':
			return node.value.reduce<Record<string, any>>((acc, curr) => {
				acc[curr.key] = eval1(curr.value);
				return acc;
			}, {});
		case 'Array':
			return node.value.map((x) => eval1(x));
		case 'String':
			return node.value;
		case 'Number':
			return node.value;
		case 'Null':
			return null;

		case 'Boolean':
			return node.value;

		default:
			return undefined;
	}
}

const ast = Parser.parse(`
[
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
}
]
`);
console.log(JSON.stringify(eval1(ast), undefined, 2));
