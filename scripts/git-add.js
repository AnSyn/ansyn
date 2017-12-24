const { execSync } = require('child_process');
const { green }= require('chalk');

function gitAdd(file) {
	console.log(green(`git add ${file}`));
	execSync('git add ' + file);
}

module.exports = gitAdd;
