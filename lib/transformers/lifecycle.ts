import { NodePath } from "@babel/traverse"
import * as t from '@babel/types';
import { rename } from "fs";

export enum Hooks {
  setup = 'setup',
  onBeforeMount = 'onBeforeMount',
  onMounted = 'onMounted',
  onBeforeUpdate = 'onBeforeUpdate',
  onUpdated = 'onUpdated',
  onBeforeUnmount = 'onBeforeUnmount',
  onUnmounted = 'onUnmounted',
  onErrorCaptured = 'onErrorCaptured',
}

export function isLifecycleHook(name: string) {
  const hooks = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'errorCaptured',
  ];
  return hooks.includes(name);
}

export const Vue23HooksMap: {[index: string]: Hooks} = {
  beforeCreate: Hooks.setup,
  created: Hooks.setup,
  beforeMount: Hooks.onBeforeMount,
  mounted: Hooks.onMounted,
  beforeUpdate: Hooks.onBeforeUpdate,
  updated: Hooks.onUpdated,
  beforeDestroy: Hooks.onBeforeUnmount,
  destroyed: Hooks.onUnmounted,
  errorCaptured: Hooks.onErrorCaptured,
}



export function convertHook(path: NodePath<t.ObjectMethod | t.ObjectProperty>) {
  if (isDeprecatedHook(path.node.key.name)) {
    return convertDeprcatedHook(path)
  }
  renameHook(path.node.key);
  let node;
  if (path.isObjectMethod()) {
    node = convertObjectMethodHook(path)
  } else {
    node = convertObjectPropertyHook(path as NodePath<t.ObjectProperty>);
  }
  let exps: t.ExpressionStatement[] = []
  if (node) {
    exps = [t.expressionStatement(t.callExpression(path.node.key, [node]))];
  }
  path.remove();
  return exps;
}

function renameHook(key: t.Identifier) {
  const name = Vue23HooksMap[key.name];
  key.name = name;
}

function isDeprecatedHook(name: string) {
  return ['beforeCreate', 'created'].includes(name);
}

function convertDeprcatedHook(path: NodePath<t.ObjectMethod | t.ObjectProperty>) {
  let body: t.Statement[] = []
  if (path.isObjectMethod()) {
    body = path.node.body.body;
  }
  if (path.isObjectProperty() && t.isFunctionExpression(path.node.value)) {
    body = path.node.value.body.body;
  }
  path.remove();
  return body;
}

function convertObjectMethodHook(path: NodePath<t.ObjectMethod>) {
  return t.arrowFunctionExpression(path.node.params, path.node.body);
}

function convertObjectPropertyHook(path: NodePath<t.ObjectProperty>) {
  if (t.isFunctionExpression(path.node.value)) {
    const value = path.node.value;
    return t.arrowFunctionExpression(value.params, value.body);
  }
  return null;
}

export function generateSetupNode<T>(path: NodePath<T>) {
  const parent = path.parentPath;
  if (parent.isObjectExpression()) {
    const s = t.objectMethod('method', t.identifier('setup'), [], t.blockStatement([]))
    parent.node.properties.push(s);
    return s;
  }
  return null;
}
