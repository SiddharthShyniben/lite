import nanoparse from 'nanoparse';
import {argv} from 'node:process';

import {exits} from './util.js';

import init from './init.js';

const realArgs = nanoparse(argv.slice(2));
const command = realArgs._.shift();

const commands = {init};

if (command in commands) {
	commands[command](realArgs);
} else {
	console.error('Unknown command:', command);
	process.exit(exits.usageError);
}
