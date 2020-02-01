import { Hooks } from '../lib/transformers/lifecycle';
import { transform } from './utils'


describe('Change lifecycle hooks', () => {
  const tests = [
    {
      name: 'Remove beforeCreate',
      input: `
        export default {
          beforeCreate() {
            console.log('test');
          },
          data() {
            const a = {};
            const b = a;
            return a;
          },
        }
      `,
      expected: `import { reactive } from "vue";
export default {
  setup() {
    const a = reactive({});
    const b = a;
    console.log('test');
    return a;
  }

};`
    },
    {
      name: 'Remove created',
      input: `
        export default {
          created() {},
        }
      `,
      expected: `export default {
  setup() {}

};`
    },
    {
      name: `Rename beforeMount to ${Hooks.onBeforeMount}`,
      input: `
        export default {
          beforeMount() {},
        }
      `,
      expected: `export default {
  setup() {
    onBeforeMount(() => {});
  }

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
  setup() {
    onMounted(() => {});
  }

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
  setup() {
    onBeforeUpdate(() => {});
  }

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
  setup() {
    onUpdated(() => {});
  }

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
  setup() {
    onBeforeUnmount(() => {});
  }

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
  setup() {
    onUnmounted(() => {});
  }

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
  setup() {
    onErrorCaptured(() => {});
  }

};`
},
{
  name: `Rename all`,
  input: `
    export default {
      beforeCreate() {
        console.log('beforeCreate');
      },
      created() {
        console.log('created');
      },
      beforeMount: function() {
        console.log('beforeMount');
      },
      mounted: function() {
        console.log('mounted');
      },
      beforeUpdate() {
        console.log('beforeUpdate');
      },
      updated() {
        console.log('updated');
      },
      beforeDestroy() {
        console.log('beforeDestroy');
      },
      destroyed() {
        console.log('destroyed');
      },
      errorCaptured() {
        console.log('errorCaptured');
      },
    }
  `,
  expected: `export default {
  setup() {
    console.log('beforeCreate');
    console.log('created');
    onBeforeMount(() => {
      console.log('beforeMount');
    });
    onMounted(() => {
      console.log('mounted');
    });
    onBeforeUpdate(() => {
      console.log('beforeUpdate');
    });
    onUpdated(() => {
      console.log('updated');
    });
    onBeforeUnmount(() => {
      console.log('beforeDestroy');
    });
    onUnmounted(() => {
      console.log('destroyed');
    });
    onErrorCaptured(() => {
      console.log('errorCaptured');
    });
  }

};`
},
  ]

  tests.forEach(it => {
    test(it.name, () => {
      expect(transform(it.input)).toBe(it.expected);
    })
  })

})

