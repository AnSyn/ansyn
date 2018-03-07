const fs = require('fs');
const packages = require('./packages-list.json');
const gitAdd = require('./git-add');
const addToGit = process.argv[2] === '--add' || process.argv[2] === '-a';

const mainPackage = JSON.parse(String(fs.readFileSync('package.json', 'utf8')));

function fix(fileName) {
	const packageJsonString = String(fs.readFileSync(fileName, 'utf8'));
	const packageJson = JSON.parse(packageJsonString);
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

	let newContent = JSON.stringify(packageJson, null, '\t');
	newContent = newContent.split('\n').join('\r\n') + '\r\n';

	if (newContent !== packageJsonString) {
		fs.writeFileSync(fileName, newContent);
		if(addToGit) {
			gitAdd(fileName);
		}
	}
}

packages.forEach((pkg) => {
	const fileName = 'src/app/@ansyn/' + pkg + '/package.json';
	fix(fileName);
});
