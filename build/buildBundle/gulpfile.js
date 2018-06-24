const gulp = require('gulp');
const gp_concat = require('gulp-concat');
const gulpSequence = require('gulp-sequence');
const distFolder = './dist';
const path = require('path');
const del = require('del');
const replace = require('replace');
const deploy = {
	withZone: {
		fileName: "ansynWithZone.js",
		local: './deployWithZone',
	},
	noZone: {
		fileName: "ansynNoZone.js",
		local: './deployNoZone',
	}
};

let currentDeploy = deploy.withZone;
const exec = require('child_process').exec;

gulp.task('clean', function () {
	return del([
		"./dist",
		deploy.withZone.local,
		deploy.noZone.local
	], {force: true});
});

gulp.task('removeZone', function (done) {
	currentDeploy = deploy.noZone;
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
	currentDeploy = deploy.withZone;
	replace({
		regex: '\// import \'zone',
		replacement: '\import \'zone',
		// 	replacement: '\'build/dist/src/app/app/',
		paths: ['../../src/polyfills.ts'],
		recursive: false,
		silent: false
	});
	return done()
});

gulp.task('webPackcompile', function (done) {
	const baseHref = process.argv[4];
	const commend = `npm run build:builder --prefix ../../ ${ baseHref ? '-- --base-href ' + baseHref : ''}`;
	console.log(commend);
	exec(commend, function (err, stdout, stderr) {
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
		.pipe(gp_concat(currentDeploy.fileName))
		.pipe(gulp.dest(currentDeploy.local));
});

gulp.task('sequenceWithZone', gulpSequence('addZone', 'webPackcompile', 'concat'));

gulp.task('sequenceNoZone', gulpSequence('removeZone', 'webPackcompile', 'concat', 'addZone'));

gulp.task('createCdn', gulpSequence('clean', 'sequenceWithZone', 'sequenceNoZone'));
