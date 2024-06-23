import { Lexer } from '../lexer';
import source from '../../spec/data/eval/eval-source.json';

describe('lexer tests', () => {
	it('should test lexer', () => {
		const tokens = Lexer.scanAll(JSON.stringify(source));
		expect(tokens).toMatchSnapshot();
	});
});
