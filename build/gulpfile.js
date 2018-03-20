const fs = require('fs')
const gulp = require('gulp');
const del = require('del');
const path = require('path')
const inlineNg2Template = require('gulp-inline-ng2-template');
const ngc = require('@angular/compiler-cli/src/main').main;
const less = require('less');
const exec = require('child_process').exec;
const replace = require('replace');
const jsonModify = require('gulp-json-modify');
const pkg = require('../package.json');
const gulpReplace = require('gulp-replace')
const gulpLess = require('gulp-less');


const inlineTemplatePluginOptions = {
	base: '../src',
	useRelativePaths: true,
	styleProcessor: (path, ext, file, cb) => {
		less.render(file, {paths: ['../src/app/@ansyn']}, (e, out) => {
			if (e) {
				console.error(e);
				throw e;
			}
			cb(null, out.css);
		});
	}
};

let preVersion = "1.5.6";

gulp.task('saveVersion', function () {
	try {
		preVersion = require('./dist/package').version
	}
	catch (e) {
		preVersion = '1.5.6'
	}
});


gulp.task('clean', ['saveVersion'], function () {
	return del([
		"dist/**",
		"src-dist/**"
	], {force: true});
});


gulp.task('copy-public-api', ['clean'], function () {

	return gulp.src([
		'../README.md',
		'../public_api.ts',
	])
		.pipe(gulp.dest('src-dist'));


});

gulp.task('copy-style', ['copy-public-api'], function () {

	return gulp.src([
		'../src/styles/**/*'
	])
		.pipe(gulpLess({
			paths: [ path.join(__dirname, '../src/app/@ansyn')]
		}))
		.pipe(gulp.dest('dist/styles'))

});


gulp.task('copy-src', ['copy-style'], function () {
	// and compile less to css
	return gulp.src([
		'../src/**/*.ts',
		'!../src/**/*.spec.ts'
	])
		.pipe(inlineNg2Template(inlineTemplatePluginOptions))
		.pipe(gulp.dest('src-dist/src'))

});

gulp.task('compile', ['copy-src'], function (done) {
	return Promise.resolve().then(() => ngc(['-p', 'tsconfig.ngc.json'], err => console.log(err)))
});

gulp.task('getAppConfig', ['compile'],  function (done) {
	const appConfig = fs.readFileSync('../src/app/@ansyn/assets/config/app.config.json');
	fs.writeFileSync('dist/defaultAppConfig.js', "export const appConfig = " + appConfig);
	return done()
});


gulp.task('copy-assets', ['getAppConfig'], function (done) {
	return gulp.src(['../src/assets/**'])
		.pipe(gulp.dest('dist/assets'))
});

gulp.task('fix-path', ['copy-assets'], function (done) {
	replace({
		regex: '\'@ansyn/',
		replacement: '\'ng-ansyn/src/app/@ansyn/',
		// replacement: '\'build/dist/src/app/app/',
		paths: ['dist/'],
		recursive: true,
		silent: true
	});

	return done()

});

gulp.task('copy_packageJson', ['fix-path'], function (done) {
	// const version = pkg.versionmain
	const versionNumber = parseInt(preVersion.slice(-1)) + 1;
	const currentVersion = preVersion.replace(/.$/, versionNumber).replace(/^./, "1");
	const peerDependencies = {
		"@angular/animations": "5.1.2",
		"@angular/common": "5.1.2",
		"@angular/compiler": "5.1.2",
		"@angular/core": "5.1.2",
		"@angular/forms": "5.1.2",
		"@angular/http": "5.1.2",
		"@angular/platform-browser": "5.1.2",
		"@angular/platform-browser-dynamic": "5.1.2",
		"@angular/router": "5.1.2"
	};
	const dependencies = {
		...pkg.dependencies,
		"@types/openlayers": "^4.6.2",
		"@types/lodash": "4.14.88",
		"@types/ol": "^4.6.1"
	};
	Object.keys(peerDependencies).forEach(key => {
		delete dependencies[key]
	});

	return gulp.src('../package.json')
		.pipe(jsonModify({
			key: 'version',
			value: currentVersion
		}))
		.pipe(jsonModify({
			key: 'name',
			value: "ng-ansyn"
		}))
		.pipe(jsonModify({
			key: 'main',
			value: 'public_api'
		}))
		.pipe(jsonModify({
			key: 'private',
			value: null
		}))
		.pipe(jsonModify({
			key: 'dependencies',
			value: dependencies
		}))
		.pipe(jsonModify({
			key: 'devDependencies',
			value: {}
		}))
		.pipe(jsonModify({
			key: 'peerDependencies',
			value: peerDependencies
		}))
		.pipe(gulp.dest('dist'));
});


gulp.task('publishNpm', ['copy_packageJson'], function (done) {
	exec('cd dist && npm publish', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		done(err);
	});
})

gulp.task('delete_src', ['publishNpm'], function (done) {
	return del([
		"src-dist/**"
	], {force: true});
});

gulp.task('build', ['delete_src'], function (done) {
	console.log("done!");
});
