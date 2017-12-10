const exec = require('child_process').exec;
exec('aws --region us-west-2 ecs list-tasks --cluster ansyn-app-cluster', (error, stdout, stderr) => {
	const tasks = JSON.parse(stdout);
	const arns = tasks.taskArns;
	arns.forEach(arn => {
		const task = arn.split('/')[1];
		exec('aws --region us-west-2 ecs stop-task --cluster ansyn-app-cluster --task ' + task, (error, stdout, stderr) => {
			console.log(stdout);
			console.log(stderr);
			if (error !== null) {
				throw new Error(`exec error: ${error}`);
			}
		});
	});
	if (error !== null) {
		throw new Error(`exec error: ${error}`);
	}
});
