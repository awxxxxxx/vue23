import { parseComponent } from 'vue-template-compiler';
import * as parser from '@babel/parser';
import generate from '@babel/generator';

import { transformJS } from './transformers/js';
import { sfcToFile } from './codegen';

const file  = `
<template>
<div>{{msg}}</div>
</template>

<script>
export default {
data () {
  var a = {
    dlsl,
  }
  var b = a;
  return b;
}
}
</script>

<style lang="css">
.red {
color: red;
}
</style>
`

let source = parseComponent(file);

if (source.script) {
  let ast  = parser.parse(source.script.content, { sourceType: 'module'});
  transformJS(ast);
  source.script.content = generate(ast).code;
  sfcToFile(source, './source.vue')
}
