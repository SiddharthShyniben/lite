import {readdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {copyFolder} from './util.js';

import prompts from 'prompts';
import signale from 'signale';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function() {
	const cwd = process.cwd();
	const files = readdirSync(cwd);

	if (files.length) {
		const {confirm} = await prompts({
			type: 'confirm',
			name: 'confirm',
			message: `Directory ${cwd} is not empty. This may overwrite files. Continue?`,
			initial: false,
		});

		if (!confirm) {
			signale.fatal('Aborted');
			process.exit(1);
		}
	}

	copyFolder(join(__dirname, 'template'), cwd);
	signale.success('Project initialized');
}
