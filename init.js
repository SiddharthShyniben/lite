import {copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync} from 'fs';
import {dirname, join} from 'path';
import prompts from 'prompts';
import {fileURLToPath} from 'url';

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
			process.exit(1);
		}
	}

	copyFolder(join(__dirname, 'template'), cwd);
	console.log('Project initialized.');
}

// Copies a folder's contents recursively to another folder
function copyFolder(source, target) {
	const files = readdirSync(source);

	if (!existsSync(target)) {
		mkdirSync(target);
	}

	for (const file of files) {
		const sourcePath = join(source, file);
		const targetPath = join(target, file);

		if (lstatSync(sourcePath).isDirectory()) {
			copyFolder(sourcePath, targetPath);
		} else {
			copyFileSync(sourcePath, targetPath);
		}
	}
}
