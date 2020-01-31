import { Hooks } from '../lib/transformers/lifecycle';
import { transform } from './utils'


describe('Change lifecycle hooks', () => {
  const tests = [
    {
      name: 'Remove beforeCreate',
      input: `
        export default {
          beforeCreate() {},
        }
      `,
      expected: `export default {};`
    },
    {
      name: 'Remove created',
      input: `
        export default {
          created() {},
        }
      `,
      expected: `export default {};`
    },
    {
      name: `Rename beforeMount to ${Hooks.onBeforeMount}`,
      input: `
        export default {
          beforeMount() {},
        }
      `,
      expected: `export default {
  onBeforeMount() {}

};`
    },
    {
      name: `Rename mounted to ${Hooks.onMounted}`,
      input: `
        export default {
          mounted() {},
        }
      `,
      expected: `export default {
  onMounted() {}

};`
    },
    {
      name: `Rename beforeUpdate to ${Hooks.onBeforeUpdate}`,
      input: `
        export default {
          beforeUpdate() {},
        }
      `,
      expected: `export default {
  onBeforeUpdate() {}

};`
    },
    {
      name: `Rename updated to ${Hooks.onUpdated}`,
      input: `
        export default {
          updated() {},
        }
      `,
      expected: `export default {
  onUpdated() {}

};`
    },
    {
      name: `Rename beforeDestroy to ${Hooks.onBeforeUnmount}`,
      input: `
        export default {
          beforeDestroy() {},
        }
      `,
      expected: `export default {
  onBeforeUnmount() {}

};`
},
{
  name: `Rename destroyed to ${Hooks.onUnmounted}`,
  input: `
    export default {
      destroyed() {},
    }
  `,
  expected: `export default {
  onUnmounted() {}

};`
},
{
  name: `Rename errorCaptured to ${Hooks.onErrorCaptured}`,
  input: `
    export default {
      errorCaptured() {},
    }
  `,
  expected: `export default {
  onErrorCaptured() {}

};`
},
  ]

  tests.forEach(it => {
    test(it.name, () => {
      expect(transform(it.input)).toBe(it.expected);
    })
  })

})

