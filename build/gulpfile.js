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
const gulpLess = require('gulp-less');
const gulpSequence = require('gulp-sequence');
const cmdArgs = require('./proccessCmdArgs')((process.argv));

const inlineTemplatePluginOptions = {
	base: '../src',
	useRelativePaths: true,
	styleProcessor: (path, ext, file, cb) => {
		less.render(file, {paths: ['../src/app/@ansyn/']}, (e, out) => {
			if (e) {
				throw e;
			}
			cb(null, out.css);
		});
	}
};


gulp.task('clean_dist', function () {
	return del([
		"dist/**",
	], {force: true});
});

gulp.task('clean_src-dist', function () {
	return del([
		"src-dist/**"
	], {force: true});
});

gulp.task('clean', function (done) {
	gulpSequence('clean_dist', 'clean_src-dist', function (err) {
		if (err) {
			throw err
		}
		else {
			return done()

		}
	})
});


gulp.task('copy-public-api', function () {

	return gulp.src([
		'../README.md',
		'../public_api.ts',
	])
		.pipe(gulp.dest('src-dist'));


});

gulp.task('copy-style', function () {

	return gulp.src([
		'../src/styles/**/*'
	])
		.pipe(gulpLess({
			paths: [path.join(__dirname, '../src/app/@ansyn')]
		}))
		.pipe(gulp.dest('dist/styles'))

});


gulp.task('copy-src', function () {
	// and compile less to css
	return gulp.src([
		'../src/**/*.ts',
		'!../src/**/*.spec.ts'
	])
		.pipe(inlineNg2Template(inlineTemplatePluginOptions))
		.pipe(gulp.dest('src-dist/src'))

});

gulp.task('compile', function (done) {
	return Promise.resolve()
		.then(() => ngc(['-p', 'tsconfig.ngc.json'], err => {
			throw err
		}))
});

gulp.task('getAppConfig', function (done) {
	const appConfig = fs.readFileSync('../src/app/@ansyn/assets/config/app.config.json');
	fs.writeFileSync('dist/defaultAppConfig.js', "export const appConfig = " + appConfig);
	return done()
});


gulp.task('copy-assets', function (done) {
	return gulp.src(['../src/app/@ansyn/assets/**'])
		.pipe(gulp.dest('dist/assets'))
});

gulp.task('fix-path', function (done) {
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

gulp.task('copy_packageJson', function (done) {

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
			value: cmdArgs && cmdArgs.version ? cmdArgs.version : null
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


gulp.task('publishNpm', function (done) {
	exec('cd dist && npm publish', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		done(err);
	});
});


gulp.task('build', function (done) {

	gulpSequence('clean', 'copy-public-api', 'copy-style', 'copy-src', 'compile', 'getAppConfig',
		'copy-assets', 'fix-path', 'copy_packageJson', (err) => {
			if (err) {
				console.log(err);
				gulpSequence('clean', () => {
					return done()
				});
			}
			else if (cmdArgs.version) {
				gulpSequence('publishNpm', 'clean', (err) => {
					console.log(err);
					gulpSequence('clean', () => {
						return done()
					})
				});

			}
			else {
				gulpSequence('clean_src-dist', () => {
					console.log("no version argument (e.g. gulp build --version 1.0.0) or (npm run build:gulp -- --version 1.0.0) - dist folder created");
					return done()
				})
			}
		})
});

gulp.task('testCompile', function (done) {
	gulpSequence('clean', 'copy-public-api', 'copy-src', 'compile', (err) => {
		gulpSequence('clean', () => {
			if (err) {
				console.log(err);
				throw err
			}
			else {
				return done()
			}
		})
	})
});
