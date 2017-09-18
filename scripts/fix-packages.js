const replace = require('replace');

replace({
	regex: '\'(.*?)\\/packages\\/', // any amount of (../) followed by `packages`
	replacement: '\'@ansyn/',
	paths: ['src/'],
	recursive: true,
	silent: false
});
