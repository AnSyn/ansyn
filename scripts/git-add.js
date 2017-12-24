const { execSync } = require('child_process');

function gitAdd(file) {
	console.log('git add ' + file);
	execSync('git add ' + file);
}

module.exports = gitAdd;
