export enum KeyWords {
  Reative = 'reactive',
  Setup = 'setup',
  Data = 'data',
  Vue = 'vue',
  Ref = 'ref',
}

export enum Hooks {
  Setup = 'setup',
  OnBeforeMount = 'onBeforeMount',
  OnMounted = 'onMounted',
  OnBeforeUpdate = 'onBeforeUpdate',
  OnUpdated = 'onUpdated',
  OnBeforeUnmount = 'onBeforeUnmount',
  OnUnmounted = 'onUnmounted',
  OnErrorCaptured = 'onErrorCaptured',
}

export const Vue23HooksMap: {[index: string]: Hooks} = {
  beforeCreate: Hooks.Setup,
  created: Hooks.Setup,
  beforeMount: Hooks.OnBeforeMount,
  mounted: Hooks.OnMounted,
  beforeUpdate: Hooks.OnBeforeUpdate,
  updated: Hooks.OnUpdated,
  beforeDestroy: Hooks.OnBeforeUnmount,
  destroyed: Hooks.OnUnmounted,
  errorCaptured: Hooks.OnErrorCaptured,
}
