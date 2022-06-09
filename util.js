import {copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

export const exits = {
	success: 0,
	failure: 1,

	usageError: 64,
	dataError: 65,
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Copies a folder's contents recursively to another folder
export function copyFolder(source, target) {
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

export function getAllFilesRecursive(dir) {
	const files = readdirSync(dir);
	const result = [];

	for (const file of files) {
		const path = join(dir, file);

		if (lstatSync(path).isDirectory()) {
			result.push(...getAllFilesRecursive(path));
		} else {
			result.push(path);
		}
	}

	return result;
}

let id = 0;
export const uid = () => id++;
