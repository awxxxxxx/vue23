import * as t from '@babel/types';
import { NodePath } from '@babel/traverse'

export function resolveTopIdentifier(name: any, node: NodePath) {
  let n = node.scope.getBinding(name);
  while(n?.path.isVariableDeclarator()) {
    if (t.isIdentifier(n.path.node.init)) {
      n = node.scope.getBinding(n.path.node.init.name);
    } else {
      return n.path;
    }
  }
  return n?.path;
}
