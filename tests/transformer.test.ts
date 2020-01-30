import * as parser from '@babel/parser';
import generate from '@babel/generator';

import { transformJS } from '../lib/transformers/js';
import { Hooks } from '../lib/transformers/symbol';

function transform(input: string) {
  const ast = parser.parse(input, { sourceType: 'module'})
  transformJS(ast);
  return generate(ast).code;
}

test('rename data method to setup', () => {
  const input = `
    export default {
      data () {
        return {};
      }
    }
  `
  const expected =`import { reactive } from "vue";
export default {
  setup() {
    const state = reactive({});
    return state;
  }

};`
  expect(transform(input)).toBe(expected);
})

test('wrap with reactive', () => {
  const input = `
    export default {
      data () {
        const a = {};
        const b = a;
        return a;
      }
    }
  `
  const expected =`import { reactive } from "vue";
export default {
  setup() {
    const a = reactive({});
    const b = a;
    return a;
  }

};`
  expect(transform(input)).toBe(expected);
})

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
      name: `Rename beforeMount to ${Hooks.OnBeforeMount}`,
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
      name: `Rename mounted to ${Hooks.OnMounted}`,
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
      name: `Rename beforeUpdate to ${Hooks.OnBeforeUpdate}`,
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
      name: `Rename updated to ${Hooks.OnUpdated}`,
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
      name: `Rename beforeDestroy to ${Hooks.OnBeforeUnmount}`,
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
  name: `Rename destroyed to ${Hooks.OnUnmounted}`,
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
  name: `Rename errorCaptured to ${Hooks.OnErrorCaptured}`,
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

