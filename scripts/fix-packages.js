const replace = require('replace');
const packages = require('./packages-list.json');
const findInFiles = require('find-in-files');
const gitAdd = require('./git-add');
const addToGit = process.argv[2] === '--add' || process.argv[2] === '-a';

function replaceAdd(options) {
	Promise.all(options.paths.map(path => findInFiles.find(options.regex, path, '.ts$'))).then(results => {
		const dirty = results.map(res => Object.keys(res)).reduce((a, b) => a.concat(b), []);
		replace(options);
		if(addToGit) {
			dirty.forEach(gitAdd);
		}
	});
}

replaceAdd({
	regex: '(\'(.*?)\\/@ansyn\\/|\'(.*?)\\/src/app\\/)', // any amount of (../) followed by `@ansyn`
	replacement: '\'@ansyn/',
	paths: ['src/'],
	recursive: true,
	silent: false
});

packages.forEach((pkg) => {
	replaceAdd({
		regex: '\'((\\.\\.\\/)+?)' + pkg + '\\/', // any amount of (../) followed by a package
		replacement: '\'@ansyn/' + pkg + '/',
		paths: ['src/'],
		recursive: true,
		silent: false
	});
});
