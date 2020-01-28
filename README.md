# vue23

A tool amids in migration from vue 2.x to 3.



### Migrating to Composition API

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
import { reactive } from '@vue';

export defalut {
  setup() {
    return reactive({
      a: 1,
      b: 2,
    })
  }
}

```



