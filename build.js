import signalePkg from 'signale';
import {parse, print, visit, types, prettyPrint} from 'recast';

import {getAllFilesRecursive} from './util.js';

import {dirname, join, relative} from 'node:path';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';

const {Signale} = signalePkg;
const b = types.builders;
const signale = new Signale({interactive: true});
const pwd = process.cwd();

export default async function() {
	const start = Date.now();
	signale.info('Building...');

	if (existsSync(join(pwd, 'dist'))) {
		rmSync(join(pwd, 'dist'), {recursive: true});
	}

	mkdirSync(join(pwd, 'dist'));
	
	const files = getAllFilesRecursive(join(pwd, 'src'));
	const templateFile = readFileSync(join(pwd, 'template.html'), 'utf8');

	for (const entry of files) {
		const asset = createAsset(entry);
		const file = templateFile.replace('<!-- html -->', asset.html).replace('<!-- css -->', asset.css).replace('<!-- js -->', asset.js);
		const outputPath = join(pwd, 'dist', relative(join(pwd, 'src'), entry).replace(/\\/g, '/'));
		writeFileSync(outputPath, file);
	}

	signale.success('Build complete in ' + (Date.now() - start) + 'ms');
}

function createAsset(path) {
	const contents = readFileSync(path, 'utf8');

	let css = '', js = '', html = contents.replace(/<script>([\s\S]+?)<\/script>/gi, (_, script) => {
		js += script;
		return '';
	}).replace(/<style>([\s\S]+?)<\/style>/gi, (_, style) => {
		css += style;
		return '';
	});

	let ast = parse(js);
	const dependencies = [];

	visit(ast, {
		visitImportDeclaration(path) {
			dependencies.push({
				path: path.node.source.value + '.html',
				name: path.node.specifiers[0].local.name
			});

			path.replace()

			return false;
		}
	});

	if (js) js = print(b.blockStatement(ast.program.body)).code;
	ast = parse(js);

	let parsedHtml = html;

	for (const dependency of dependencies) {
		const asset = createAsset(join(pwd, dependency.path));
		parsedHtml = parsedHtml.replace(new RegExp(`<${dependency.name}[a-zA-Z-_=\\s"']+?\\/>`, 'gi'), asset.html);

		if (asset.js) {
			const aast = parse(asset.js);
			ast.program.body.push(b.blockStatement(aast.program.body));
		}

		css += '\n\n\n' + asset.css;
	}

	// cleanup
	visit(ast, {
		visitBlockStatement(path) {
			if (path.node.body.length === 0) path.replace();
			if (path.node.body.every(node => node.type === 'BlockStatement')) path.replace(...path.node.body)
			this.traverse(path);
		}
	})

	js = prettyPrint(ast).code;

	return {html: parsedHtml.trim(), css: css.trim(), js: js.trim()};
}
