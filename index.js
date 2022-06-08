import nanoparse from 'nanoparse';
import {argv} from 'node:process';

const args = nanoparse(argv);
console.log('Hello, world!');
console.log(args);
