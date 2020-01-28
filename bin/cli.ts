#! /usr/bin/env node

import program from 'commander';

program.command('convert <dir>')
  .description('convert js to json')
  .option('-o, --output [path]', 'output path for converted json file')
  .option('-t, --type [type]', 'type to convert includes [schema, example]')
  .option('-i --include [include files]', 'include files')
  .option('-e, --exclude [exclude files]', 'exclude files')
  .action((cmd, dir) => {

  })

program.parse(process.argv);
