import { Lexer } from '../src/lexer';
import { TokenType } from '../src/token';

// Take from https://cs.opensource.google/go/go/+/refs/tags/go1.17.7:src/encoding/json/number_test.go;l=12
describe('Number parsing', () => {
	const validNumbers = [
		'0',
		'-0',
		'1',
		'-1',
		'0.1',
		'-0.1',
		'1234',
		'-1234',
		'12.34',
		'-12.34',
		'12E0',
		'12E1',
		'12e34',
		'12E-0',
		'12e+1',
		'12e-34',
		'-12E0',
		'-12E1',
		'-12e34',
		'-12E-0',
		'-12e+1',
		'-12e-34',
		'1.2E0',
		'1.2E1',
		'1.2e34',
		'1.2E-0',
		'1.2e+1',
		'1.2e-34',
		'-1.2E0',
		'-1.2E1',
		'-1.2e34',
		'-1.2E-0',
		'-1.2e+1',
		'-1.2e-34',
		'0E0',
		'0E1',
		'0e34',
		'0E-0',
		'0e+1',
		'0e-34',
		'-0E0',
		'-0E1',
		'-0e34',
		'-0E-0',
		'-0e+1',
		'-0e-34',
	];

	const invalidNumbers = [

		'1.0.1',
		'1..1',
		'-1-2',
		'012a42',
		'01.2',
		'012',
		'12E12.12',
		'1e2e3',
		'1e+-2',
		'1e--23',
		'1e',
		'e1',
		'1e+',
		'1ea',
		'1a',
		'1.a',
		'1.',
		'01',
		'1.e1',
	];

	const numberRegex = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

	it('should parse all valid numbers', () => {
		validNumbers.forEach((n) => {
			const lexer = new Lexer(n);
			const token = lexer.next();
			expect(numberRegex.test(n)).toBe(true);
			expect(token.type).toBe(TokenType.Number);
			expect(token.value).toBe(n);
			expect(parseFloat(n)).not.toBeNaN();
		});
	});

	xit('should not parse all invalid numbers', () => {
		invalidNumbers.forEach((n) => {
			const lexer = new Lexer(n);
			expect(numberRegex.test(n)).toBe(false);
			expect(() => lexer.next()).toThrow('Invalid number');
		});
	});
});
