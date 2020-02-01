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

export function hasReturnStatement(bs: t.Statement | null, depth: number, maxDepth = 2) {
  if (depth > maxDepth) {
    return false;
  }
  if (bs === null) {
    return false;
  }
  if (t.isBlockStatement(bs)) {
    bs.body.forEach(it => {
      if (t.isReturnStatement(it)) {
        return true;
      }
      if (t.isIfStatement(it)) {
        return hasReturnStatement(it.consequent, depth + 1) || hasReturnStatement(it.alternate, depth + 1)
      }
    })
  }
  return false;
}

export function findIndexOfReturnStatement(ss: t.Statement[]) {
  for (let i = 0; i < ss.length; i++) {
    if (hasReturnStatement(ss[i], 1)) {
      return i;
    }
  }
  return -1;
}
