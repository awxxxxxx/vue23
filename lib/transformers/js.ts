import traverse, { NodePath } from "@babel/traverse";
import * as t from '@babel/types';

import { File } from "@babel/types";
import { KeyWords } from "./symbol";

const defaultImportOptions = {
  reactive: false,
  ref: false,
}

type ImportOptions = typeof defaultImportOptions;

const Identifiers = {
  [KeyWords.Reative]: t.identifier(KeyWords.Reative),
  [KeyWords.Ref]: t.identifier(KeyWords.Ref),
}

const Literals = {
  [KeyWords.Vue]: t.stringLiteral(KeyWords.Vue),
}

const ImportDependencies = {
  [KeyWords.Reative]: t.importSpecifier(Identifiers[KeyWords.Reative], Identifiers[KeyWords.Reative]),
  [KeyWords.Ref]: t.importSpecifier(Identifiers[KeyWords.Ref], Identifiers[KeyWords.Ref]),
}

function resolveTopIdentifier(name: any, node: NodePath) {
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

function wrapWithReactive(args: t.CallExpression['arguments']) {
  return t.callExpression(Identifiers[KeyWords.Reative], args);
}

function importDependencies(path: NodePath<t.Program>, options: ImportOptions) {
  let specifiers: t.ImportSpecifier[] = [];

  // import 'reactive'
  if (options.reactive) {
    specifiers.push(ImportDependencies[KeyWords.Reative]);
  }
  if (options.ref) {
    specifiers.push(ImportDependencies[KeyWords.Ref])
  }
  const i = t.importDeclaration(specifiers, Literals[KeyWords.Vue]);
  path.node.body.unshift(i);
}

export function transformJS(ast: File) {
  let options = Object.assign({}, defaultImportOptions);
  traverse(ast, {
    exit(path) {
      if (path.isProgram()) {
        importDependencies(path, options);
        options = defaultImportOptions;
      }
    },
    ReturnStatement(path) {
      if (t.isObjectMethod(path.parentPath.parentPath.node)) {
        const gp = path.parentPath.parentPath as NodePath<t.ObjectMethod>
        if (t.isIdentifier(gp.node.key, { name: KeyWords.Data})) {
          // rename 'data' to 'setup'
          gp.node.key.name = KeyWords.Setup;

          if (t.isIdentifier(path.node.argument)) {
            const n = resolveTopIdentifier(path.node.argument.name, path)
            if (n?.isVariableDeclarator()) {
              let args = [];
              if (n.node.init) {
                args.push(n.node.init);
              }
              const call = wrapWithReactive(args)
              const v = t.variableDeclarator(n.node.id, call);
              n.replaceWith(v);
            }
            options.reactive = true;
          } else if (path.node.argument) {
            const call = wrapWithReactive([path.node.argument])
            const re = t.returnStatement(call);
            path.replaceWith(re);
            options.reactive = true;
          }
        }
      }
    }
  })
}
