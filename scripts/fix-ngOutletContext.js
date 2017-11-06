const replace = require('replace');

replace({
	regex: 'ngOutletContext',
	replacement: 'ngTemplateOutletContext',
	paths: ['node_modules/angular-tree-component/'],
	recursive: true,
	silent: false
});
