const fs = require('fs');

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
	'status-bar'
];

const mainPackage = JSON.parse(String(fs.readFileSync('package.json', 'utf8')));

packages.forEach((pkg) => {
	const fileName = 'src/app/packages/' + pkg + '/package.json';
	const packageJson = JSON.parse(String(fs.readFileSync(fileName, 'utf8')));
	packageJson.version = mainPackage.version;
	packageJson.license = mainPackage.license;

	if (packageJson.peerDependencies) {
		Object.keys(packageJson.peerDependencies).forEach(name => {
			if (name in mainPackage.devDependencies) {
				packageJson.peerDependencies[name] = mainPackage.devDependencies[name];
			}

			if (name in mainPackage.dependencies) {
				packageJson.peerDependencies[name] = mainPackage.dependencies[name];
			}

			if (name.substr(0, 7) === '@ansyn/') {
				packageJson.peerDependencies[name] = packageJson.version;
			}
		});
	}

	fs.writeFileSync(fileName, JSON.stringify(packageJson, null, '\t'));
});
