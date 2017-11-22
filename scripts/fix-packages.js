const replace = require('replace');

replace({
	regex: '(\'(.*?)\\/packages\\/|\'(.*?)\\/src/app\\/)', // any amount of (../) followed by `packages`
	replacement: '\'@ansyn/',
	paths: ['src/'],
	recursive: true,
	silent: false
});

const packages = [
	'cesium-map',
	'context',
	'core',
	'imagery',
	'login',
	'map-facade',
	'menu',
	'menu-items',
	'open-layer-center-marker-plugin',
	'open-layer-visualizers',
	'open-layers-map',
	'overlays',
	'router',
	'status-bar',
	'utils'
];

packages.forEach((pkg) => {
	replace({
		regex: '\'((\\.\\.\\/)+?)' + pkg + '\\/', // any amount of (../) followed by a package
		replacement: '\'@ansyn/' + pkg + '/',
		paths: ['src/'],
		recursive: true,
		silent: false
	});
});
