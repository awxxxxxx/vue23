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
  if (t.isReturnStatement(bs)) {
    return true;
  }
  if (t.isIfStatement(bs)) {
    if (hasReturnStatement(bs.consequent, depth + 1, maxDepth) || hasReturnStatement(bs.alternate, depth + 1, maxDepth)) {
      return true;
    }
  }
  if (t.isBlockStatement(bs)) {
    for (let i = 0; i < bs.body.length; i++) {
      const it = bs.body[i];
      if (hasReturnStatement(it, depth + 1, maxDepth)) {
        return true;
      }
    }
  }
  return false;
}

export function findIndexOfReturnStatement(ss: t.Statement[]) {
  for (let i = 0; i < ss.length; i++) {
    if (hasReturnStatement(ss[i], 1, 5)) {
      return i;
    }
  }
  return -1;
}
