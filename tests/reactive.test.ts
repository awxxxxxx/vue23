import { transform } from './utils'

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
