import nanoparse from 'nanoparse';
import signale from 'signale';

import {argv} from 'node:process';

import {exits} from './util.js';

import init from './init.js';
import build from './build.js';

const realArgs = nanoparse(argv.slice(2));
const command = realArgs._.shift();

const commands = {init, build};

if (command in commands) {
	commands[command](realArgs);
} else {
	signale.fatal(`Unknown command: ${command}`);
	process.exit(exits.usageError);
}
