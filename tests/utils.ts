import * as parser from '@babel/parser';
import generate from '@babel/generator';
import { transformJS } from '../lib/transformers/js';

export function transform(input: string) {
  const ast = parser.parse(input, { sourceType: 'module'})
  transformJS(ast);
  return generate(ast).code;
}
