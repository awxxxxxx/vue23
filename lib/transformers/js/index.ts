import traverse, { NodePath } from "@babel/traverse";
import * as t from '@babel/types';
import { File } from "@babel/types";

import { resolveTopIdentifier, findIndexOfReturnStatement } from '../utils'
import { KeyWords } from '../symbol';
import { convertHook,isLifecycleHook, generateSetupNode } from '../lifecycle';

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

function insertStatements(ss: t.Statement[], exps: t.Statement[]) {
  let index = findIndexOfReturnStatement(ss);
  index = index > -1 ? index : ss.length - 1;
  ss.splice(index, 0, ...exps);
}

export function transformJS(ast: File) {
  let options = Object.assign({}, defaultImportOptions);
  let setupNode: NodePath<t.ObjectMethod | t.ObjectProperty> | null = null;
  let lifecycleHooksPath: Array<{
    exps: Array<t.ExpressionStatement | t.Statement>,
    path: NodePath<t.ObjectMethod | t.ObjectProperty>
  }> = [];

  traverse(ast, {
    Program: {
      exit(path) {
        importDependencies(path, options);
        options = defaultImportOptions;
        if (lifecycleHooksPath.length) {
          const node = setupNode ? setupNode.node : generateSetupNode(lifecycleHooksPath[0].path);
          const exps = lifecycleHooksPath.reduce((previous, current) => {
            return previous.concat(current.exps);
          }, [] as t.Statement[]);
          if (t.isObjectMethod(node)) {
            insertStatements(node.body.body, exps)
          } else if (t.isObjectProperty(node) && t.isFunctionExpression(node.value)) {
            const value = node.value as t.FunctionExpression;
            insertStatements(value.body.body, exps)
          }
          lifecycleHooksPath = []
        }
      },
    },
    ObjectMethod(path) {
      if (isLifecycleHook(path.node.key.name)) {
        lifecycleHooksPath.push({ exps: convertHook(path), path });
      }
    },
    ObjectProperty(path) {
      if (isLifecycleHook(path.node.key.name) && t.isFunctionExpression(path.node.value)) {
        lifecycleHooksPath.push({ exps: convertHook(path), path });
      }
    },
    ReturnStatement(path) {
      const parent = path.getFunctionParent();
      if (t.isObjectMethod(parent.node)) {
        const gp = parent as NodePath<t.ObjectMethod>;
        setupNode = gp;
        if (t.isIdentifier(gp.node.key, { name: KeyWords.Data})) {
          // rename 'data' to 'setup'
          gp.node.key.name = KeyWords.Setup;
          setupNode = gp;
          // @TODO extract to another function
          // make varibale reactivity
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
            if (path.scope.hasOwnBinding('state')) {
              path.scope.rename('state')
            }
            let re;
            if (t.isBlockStatement(path.parentPath.node)) {
              const nstateIdentifier = t.identifier('state');
              gp.scope.push({ id: nstateIdentifier, init: call, kind: 'const' })
              re = t.returnStatement(
                t.objectExpression([t.objectProperty(nstateIdentifier, nstateIdentifier)])
              );
            } else {
              re = t.returnStatement(
                t.objectExpression([t.objectProperty(call, call)])
              );
            }
            options.reactive = true;
            path.replaceWith(re);
          }
        }
      }
    }
  })
}
