const replace = require('replace');

replace({
	// Note that using + instead of * does not reinforce an edge case...
	regex: '(\\.\\.\\/)*\\.\\.\\/packages', // any amount of (../) followed by `packages`
	replacement: '@ansyn',
	paths: ['src/'],
	recursive: true,
	silent: false
});
