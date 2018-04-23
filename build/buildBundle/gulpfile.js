const gulp = require('gulp');
const gp_concat = require('gulp-concat');
const gulpSequence = require('gulp-sequence');
const distFolder = '../../dist';
const path = require('path')
const del = require('del');
const replace = require('replace');
const credentials = require('./gitCred')
const deploy = {
	withZone: {
		local: './deployWithZone',
		remote: 'https://' + credentials.user + ':' + credentials.password +'@gist.github.com/shaharido1/4b6d5fc928654e4e497b6d2e270df144'
	},
	noZone: {
		local: './deployNoZone',
		remote: 'https://' + credentials.user + ':' + credentials.password + '@gist.github.com/shaharido1/8488dcd6254b855669fbff7fb5a11baf'
	}
};
let currentDeploy = deploy.withZone;
const exec = require('child_process').exec;


const gulpGit = require('gulp-git');

gulp.task('clean', function () {
	return del([
		"../../dist/**",
		deploy.withZone.local,
		deploy.noZone.local
	], {force: true});
});

gulp.task('git-credentials', function(done){
	const setPassword = "git config --global credential.helper cache";
	exec(setPassword, function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		return done(err)
	})
})

gulp.task('removeZone', function (done) {
	replace({
		regex: '\import \'zone.js',
		replacement: '\/\/ import \'zone.js',
		// replacement: '\'build/dist/src/app/app/',
		paths: ['../../src/polyfills.ts'],
		recursive: false,
		silent: false
	});
	return done()
});

gulp.task('addZone', function (done) {
	replace({
		regex: '\// import \'zone',
		replacement: '\import \'zone',
		// replacement: '\'build/dist/src/app/app/',
		paths: ['../../src/polyfills.ts'],
		recursive: false,
		silent: false
	});
	return done()
});


gulp.task('webPackcompile', function (done) {
	exec('cd ../../ && ng build', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		done(err);
	});
});

gulp.task('concat', function () {
	return gulp.src([
		"./start.txt",
		path.join(distFolder, 'inline.bundle.js'),
		path.join(distFolder, 'polyfills.bundle.js'),
		path.join(distFolder, 'scripts.bundle.js'),
		path.join(distFolder, 'styles.bundle.js'),
		path.join(distFolder, 'vendor.bundle.js'),
		path.join(distFolder, 'main.bundle.js'),
		'./end.txt'
	])
		.pipe(gp_concat('ansyn.cdn.withZone.js'))
		.pipe(gulp.dest(currentDeploy.local));
});

gulp.task('git-init', function (done) {
	process.chdir(currentDeploy.local);
	gulpGit.init(function (err) {
		if (err) {
			console.log(err);
			throw err;
		}
		else {
			done();
		}
	});
});


gulp.task('git-add', function () {
	const deploypath = path.join(__dirname, currentDeploy.local);
	return gulp.src(path.join(deploypath, '**/*'))
		.pipe(gulpGit.add());
});

gulp.task('git-commit', function () {
	const deploypath = path.join(__dirname, currentDeploy.local);

	let preVersion = "1.5.6";
	try {
		preVersion = require('./dist/package').version
	}
	catch (e) {
		preVersion = '1.5.6'
	}

	return gulp.src(path.join(deploypath, '**/*'))
		.pipe(gulpGit.commit(`v${preVersion}`));
});


gulp.task('git-addRemote', function (done) {
	const deploypath = path.join(__dirname, currentDeploy.local);
	const addRemoteOrigin = 'cd ' + deploypath + ' && git remote add origin ' + currentDeploy.remote;
	exec(addRemoteOrigin, function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		if ((err && err.code === 128)) {
			const setRemoteOrgion = 'cd ' + deploypath + ' && git remote set-url origin ' + currentDeploy.remote;
			exec(setRemoteOrgion, function (err, stdout, stderr) {
				console.log(stdout);
				console.log(stderr);
				return done(err);
			})
		}
	else {
			return done(err);
		}
	});
});

gulp.task('git-push', function (done) {
	const deploypath = path.join(__dirname, currentDeploy.local);
	const addRemoteOrigin = 'cd ' + deploypath + ' && git push origin master --force';
	exec(addRemoteOrigin, function (err, stdout, stderr) {
		return done(err)
	})
});


gulp.task('sequenceWithZone', function (done) {
	currentDeploy = deploy.withZone;
	gulpSequence('clean', 'addZone', 'webPackcompile', 'concat', 'git-init', 'git-add', 'git-commit', 'git-addRemote', 'git-push', function (err) {
		console.log(err);
		return done()
	})
});

gulp.task('sequenceNoZone', function (done) {
	currentDeploy = deploy.noZone;
	gulpSequence('clean', 'removeZone', 'webPackcompile', 'concat', 'git-init', 'git-add', 'git-commit', 'git-addRemote', 'git-push', function (err) {
		console.log(err);
		return done()
	})
});

gulp.task('createCdn', function (done) {
	gulpSequence('sequenceWithZone', 'sequenceNoZone', function (err) {
		console.log(err);
		return done()
	})
});
