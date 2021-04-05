# vue23

A tool amids in migration from vue 2.x to 3.



### Migrating to Composition API

#### setup

```javascript
// before
export defalut {
  data() {
    return {
      a: 1,
      b: 2,
    }
  }
}

// after
import { reactive } from 'vue';

export defalut {
  setup() {
    const state = reactive({
      a: 1,
      b: 2,
    })
    return {
      state: state,
    };
  }
}

// before
export defalut {
  data() {
    var a = {};
    var b = a;
    return b;
  }
}

// after
import { reactive } from 'vue';

export defalut {
  setup() {
    var a = reative({});
    var b = a;
    return b;
  }
}

```

#### reactive

#### computed

#### watch

#### Lifecycle Hooks

#### provide & inject

### TypeScript support

#### defineCompondent



