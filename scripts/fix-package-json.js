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

	if (packageJson.dependencies) {
		Object.keys(packageJson.dependencies).forEach(name => {
			if (name in mainPackage.dependencies) {
				packageJson.dependencies[name] = mainPackage.devDependencies[name];
			}

			if (name in mainPackage.dependencies) {
				packageJson.dependencies[name] = mainPackage.dependencies[name];
			}

			if (name.substr(0, 7) === '@ansyn/' && packages.includes(name.substr(7))) {
				packageJson.dependencies[name] = packageJson.version;
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
