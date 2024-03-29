import { transform } from './utils'

describe('Make reactive', () => {
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
    return {
      state: state
    };
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
        return b;
      }
    }
  `
  const expected =`import { reactive } from "vue";
export default {
  setup() {
    const a = reactive({});
    const b = a;
    return b;
  }

};`
  expect(transform(input)).toBe(expected);
})

})
