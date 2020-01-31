import { NodePath } from "@babel/traverse"
import * as t from '@babel/types';

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
  const name = Vue23HooksMap[path.node.key.name];
  if (name !== Hooks.setup) {
    path.node.key.name = name;
  } else {
    // TODO remove all path
    path.remove();
  }
  let node;
  if (path.isObjectMethod()) {
    node = t.arrowFunctionExpression(path.node.params, path.node.body);
  } else if (path.isObjectProperty() && path.isFunctionExpression(path.node.value)) {
    const value = path.node.value as t.FunctionExpression;
    node = t.arrowFunctionExpression(value.params, value.body);
  } else {
    node = t.arrowFunctionExpression([], t.blockStatement([]));
  }
  // return t.expressionStatement(t.callExpression(path.node.key, [node]))
}
