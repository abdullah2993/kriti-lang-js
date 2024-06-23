interface Node {
	readonly type: 'String' | 'Number' | 'Object' | 'Array' | 'Boolean' | 'Null' | 'Property'
	| 'KritiRange' | 'KritiIf' | 'KritiPath';
}

export type TNode = StringNode | NumberNode | ObjectNode
| ArrayNode | BooleanNode | NullNode | PropertyNode | RangeNode | IfNode | PathNode;

export class StringNode implements Node {
	readonly type = 'String';

	constructor(public value: string) { }
}

export class NumberNode implements Node {
	readonly type = 'Number';

	constructor(public value: number) { }
}

export class ObjectNode implements Node {
	readonly type = 'Object';

	constructor(public value: PropertyNode[] = []) { }
}

export class ArrayNode implements Node {
	readonly type = 'Array';

	constructor(public value: TNode[] = []) { }
}

export class BooleanNode implements Node {
	readonly type = 'Boolean';

	constructor(public value: boolean) { }
}

export class NullNode implements Node {
	readonly type = 'Null';
}

export class PropertyNode implements Node {
	readonly type = 'Property';

	constructor(public key: string, public value: TNode) { }
}

export class RangeNode implements Node {
	readonly type = 'KritiRange';

	constructor(public indexIdentifier: string, public valueIdentifier: string, public itertable: Node, public body: TNode) { }
}

export class IfNode implements Node {
	readonly type = 'KritiIf';

	constructor(public condition: Node, public body: TNode, public elseBody: TNode) { }
}

export class PathNode implements Node {
	readonly type = 'KritiPath';

	constructor(public path: string) { }
}
