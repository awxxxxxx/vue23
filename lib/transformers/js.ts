import traverse, { NodePath } from "@babel/traverse";
import * as t from '@babel/types';
import { File } from "@babel/types";

import { resolveTopIdentifier } from './utils'
import { KeyWords } from './symbol';
import { convertHook,isLifecycleHook } from './lifecycle';

const defaultImportOptions = {
  reactive: false,
  ref: false,
}

let dataNode: NodePath<t.ObjectMethod | t.ObjectProperty> | null = null;

let lifecycleHooksPath: NodePath<t.ObjectMethod | t.ObjectProperty>[] = []

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


function wrapWithReactive(args: t.CallExpression['arguments']) {
  return t.callExpression(Identifiers[KeyWords.Reative], args);
}

function renameScopeVariable<T>(path: NodePath<T>, name: string) {
  path.scope.rename(name);
}

function importDependencies(path: NodePath<t.Program>, options: ImportOptions) {
  let specifiers: t.ImportSpecifier[] = [];

  // import 'reactive'
  if (options.reactive) {
    specifiers.push(ImportDependencies[KeyWords.Reative]);
    renameScopeVariable(path, KeyWords.Reative);
  }
  if (options.ref) {
    specifiers.push(ImportDependencies[KeyWords.Ref])
    renameScopeVariable(path, KeyWords.Reative);
  }
  if (specifiers.length) {
    const i = t.importDeclaration(specifiers, Literals[KeyWords.Vue]);
    path.node.body.unshift(i);
  }
}

export function transformJS(ast: File) {
  let options = Object.assign({}, defaultImportOptions);
  traverse(ast, {
    Program: {
      exit(path) {
        importDependencies(path, options);
        options = defaultImportOptions;
        if (dataNode) {
         // TODO put lifecycle in data
        }
      },
    },
    ObjectMethod(path) {
      if (isLifecycleHook(path.node.key.name)) {
        convertHook(path);
        // lifecycleHooksPath.push(path);
      }
    },
    ObjectProperty(path) {
      if (isLifecycleHook(path.node.key.name) && t.isFunctionExpression(path.node.value)) {
        convertHook(path);
        // lifecycleHooksPath.push(path);
      }
    },
    ReturnStatement(path) {
      const parent = path.getFunctionParent();
      if (t.isObjectMethod(parent.node)) {
        const gp = parent as NodePath<t.ObjectMethod>;
        dataNode = gp;
        if (t.isIdentifier(gp.node.key, { name: KeyWords.Data})) {
          // rename 'data' to 'setup'
          gp.node.key.name = KeyWords.Setup;
          dataNode = gp;
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
            const nstateIdentifier = t.identifier('state');
            if (path.scope.hasOwnBinding('state')) {
              path.scope.rename('state')
            }
            let re;
            if (t.isBlockStatement(path.parentPath.node)) {
              gp.scope.push({ id: nstateIdentifier, init: call, kind: 'const' })
              re = t.returnStatement(nstateIdentifier);
            } else {
              re = t.returnStatement(call);
            }
            options.reactive = true;
            path.replaceWith(re);
          }
        }
      }
    }
  })
}
