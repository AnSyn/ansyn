const replace = require('replace');
const packages = require('./packages-list.json');

replace({
	regex: '(\'(.*?)\\/packages\\/|\'(.*?)\\/src/app\\/)', // any amount of (../) followed by `packages`
	replacement: '\'@ansyn/',
	paths: ['src/'],
	recursive: true,
	silent: false
});

packages.forEach((pkg) => {
	replace({
		regex: '\'((\\.\\.\\/)+?)' + pkg + '\\/', // any amount of (../) followed by a package
		replacement: '\'@ansyn/' + pkg + '/',
		paths: ['src/'],
		recursive: true,
		silent: false
	});
});
