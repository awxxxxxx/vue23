import * as parser from '@babel/parser';
import generate from '@babel/generator';

import { transformJS } from '../lib/transformers/js';

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
    return reactive({});
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

test('change lifecycle hooks', () => {
  const input = `
    export default {
      beforeMount() {},
      mounted() {},
      beforeUpdate() {},
      updated() {},
      beforeDestroy() {},
      destroyed: function() {},
      errorCaptured() {},
    }
  `
  const expected = `export default {
  onBeforeMount() {},

  onMounted() {},

  onBeforeUpdate() {},

  onUpdated() {},

  onBeforeUnmount() {},

  onUnmounted: function () {},

  onErrorCaptured() {}

};`
  expect(transform(input)).toBe(expected);
})
