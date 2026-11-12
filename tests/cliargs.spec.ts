import { test, expect } from '@playwright/test'
import { parseArgs } from 'node:util';
let inscopeforalltests: any;

test('Read custom CLI args', ({}, testInfo) => {
  const separator = testInfo.config.argv.indexOf('--'); //-1 if -- is not found

  const customArgs =
    separator === -1 
      ? [] //if no custom args i.e. no -- separator store empty array
      : testInfo.config.argv.slice(separator + 1); //else return everything after --

  const { values } = parseArgs({ //Use NodeJS to parse custom args in to an object
    args: customArgs, 
    options: { // define shape of custom CLI options
      'custom-arg-string': {
        type: 'string'
      },
      custombool: {
        type: 'boolean'
      }
    }
  });
  inscopeforalltests = values;
  console.log('Parsed custom args:', values);
  console.log('Custom arg string:', values['custom-arg-string']);
  console.log('Custom args missing from process.arg: '); 
  console.log(process.argv); //Only args passed to worker process
});

test('Another test', ()=>{
    inscopeforalltests
})