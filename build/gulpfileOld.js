const gulp = require('gulp');

const git = require('gulp-git');

const shell = require('gulp-shell');

const del = require('del');

const pkg = require('../package.json');


const inlineNg2Template = require('gulp-inline-ng2-template');

const jsonModify = require('gulp-json-modify')

const path = require('path');

const fs = require('fs');

const runSequence = require('run-sequence');

const replace = require('gulp-replace');

const rename = require('gulp-rename');

const toPascalCase = require('to-pascal-case');

const commandLineArgs = require('command-line-args');

const rollup = require('rollup');
const rollupGlobals = require('./rollup.globals');
const alias = require('rollup-plugin-alias');

const plato = require('es6-plato');

const ngc = require('@angular/compiler-cli/src/main').main;

const eslintRules = require('eslint/conf/eslint-recommended');



const optionDefinitions = [

	{ name: 'dest', alias: 'd', type: String, defaultValue: `c:\\packages\\${pkg.name}` },

	{ name: 'href', alias: 'h', type: String, defaultValue: '/' },

	{ name: 'name', alias: 'm', type: String, defaultValue: pkg.name }

];


const nodeResolve = require('rollup-plugin-node-resolve');


const options = commandLineArgs(optionDefinitions);



const publishPath = options.dest;



if (options.dest != null) {

	console.log(`publish-path: `, `${options.dest}`);

}

if (options.name != null) {

	console.log(`module-name: `, `${options.name}`);

}

if (options.href != null) {

	console.log(`base-href: `, `${options.href}`);

}





gulp.task('clean', function () {

	return del([

		"dist/**",
		"src-dist/**"

	], { force: true });

});



gulp.task('copy-public-api', [], function () {

	return gulp.src([

		'../README.md',

		'../public_api.ts'

	])

	//.pipe(replace('./app', './src'))

		.pipe(gulp.dest('src-dist'))



});

gulp.task('copy-src', ['copy-public-api'], function () {

	return gulp.src([

		'../src/**/*.ts',

		'!../src/**/*.spec.ts'

	])

		.pipe(inlineNg2Template({ base: '../src', useRelativePaths: true }))

		.pipe(gulp.dest('src-dist/src'))

});



// gulp.task('compile-es6', ['copy-src'], function () {
//
// 	return Promise.resolve().then(
//
// 		()=> ngc(['-p', 'tsconfig.ngc.json', '-t', 'es6'], (err)=> console.error(err))
//
// );
//
// });



gulp.task('compile-es5', ['copy-src'], function () {

	return Promise.resolve().then(

		()=> ngc(['-p', 'tsconfig.ngc.json', '-t', 'es5'], (err)=> console.error(err))

);

});


//
// gulp.task('bundle-es6', ['compile-es6'], function (done) {
//
// 	var external = Object.keys(rollupGlobals);
//
// 	var globals = rollupGlobals;
//
//
// 	rollup.rollup({
//
// 		input: 'dist/index.js',
//
// 		onwarn: function (warning) {
//
// 			// if (warning.message.indexOf("treating it as an external dependency") > -1)
//
// 			//     return;
//
//
//
// 			if (warning.message.indexOf("external module '@angular/core' but never used"))
//
// 				return;
//
//
//
// 			if (warning.message.indexOf("external module '@angular/platform-browser' but never used"))
//
// 				return;
//
//
//
// 			console.warn("is this warnning" + warning.message);
//
// 		},
//
// 		plugins:   [
// 			alias({
// 				'@ansyn/app': path.join(__dirname, '/dist/src/app/app'),
// 				'@ansyn': path.join(__dirname, '/dist/src/app/packages')
// 			})
//
// 		],
//
//
//
//
// }).then(function (bundle) {
//
// 		var es = bundle.write({
//
// 			file: `dist/index.es6.js`,
//
// 			format: 'es',
//
// 			exports: 'named',
//
// 			name: pkg.name,
//
// 			sourcemap: true,
//
// 			external: external,
//
// 			globals: globals
//
//
//
// 		})
//
//
//
// 		return Promise.all([es]).then(function () {
//
// 			done();
//
// 		});
//
//
//
// 	}).catch(err => console.log("this err" + err))
//
// });
//
//
//
gulp.task('bundle-es5', ['compile-es5'], function (done) {



	var external = Object.keys(rollupGlobals);

	var globals = rollupGlobals;



	rollup.rollup({

		input: 'dist/index.js',

		onwarn: function (warning) {

			// if (warning.message.indexOf("treating it as an external dependency") > -1)

			//     return;



			if (warning.message.indexOf("external module '@angular/core' but never used"))

				return;



			if (warning.message.indexOf("external module '@angular/platform-browser' but never used"))

				return;



			console.warn(warning.message);

		}


//
// 	}).then(function (bundle) {
//
// 		var umd = bundle.write({
//
// 			file: `dist/bundles/${pkg.name}.umd.js`,
//
// 			format: 'umd',
//
// 			exports: 'named',
//
// 			name: pkg.name,
//
// 			sourcemap: true,
//
// 			external: external,
//
// 			globals: globals
//
// 		});
//
// 		var cjs = bundle.write({
//
// 			file: `dist/bundles/${pkg.name}.cjs.js`,
//
// 			format: 'cjs',
//
// 			exports: 'named',
//
// 			name: pkg.name,
//
// 			sourcemap: true,
//
// 			external: external,
//
// 			globals: globals
//
// 		});
//
// 		var amd = bundle.write({
//
// 			file: `dist/bundles/${pkg.name}.amd.js`,
//
// 			format: 'amd',
//
// 			exports: 'named',
//
// 			name: pkg.name,
//
// 			sourcemap: true,
//
// 			external: external,
//
// 			globals: globals
//
// 		});
//
//
//
// 		var es = bundle.write({
//
// 			file: `dist/index.es5.js`,
//
// 			format: 'es',
//
// 			exports: 'named',
//
// 			name: pkg.name,
//
// 			sourcemap: true,
//
// 			external: external,
//
// 			globals: globals
//
//
//
// 		});
//
//
//
// 		return Promise.all([umd, cjs, amd, es]).then(function () {
//
// 			done();
//
// 		});
//
//
//
// 	});
//
// });









/*

gulp.task('copy-package-json', function () {

	var main = pkg.main;

	var module = pkg.module;

	var es2015 = pkg.es2015;

	var typings = pkg.typings;

	var metadata = pkg.metadata;



	var prefix = new RegExp('^(dist/)', "g");

	var srcPath = path.resolve('../');

	return gulp.src([

		path.join(srcPath, 'package.json')

	], { base: srcPath })

		.pipe(jsonModify({

			key: 'main',

			value: main.replace(prefix, '')

		}))

		.pipe(jsonModify({

			key: 'module',

			value: module.replace(prefix, '')

		}))

		.pipe(jsonModify({

			key: 'es2015',

			value: es2015.replace(prefix, '')

		}))

		.pipe(jsonModify({

			key: 'typings',

			value: typings.replace(prefix, '')

		}))

		.pipe(jsonModify({

			key: 'metadata',

			value: metadata.replace(prefix, '')

		}))

		.pipe(gulp.dest('dist'));

});


*/


gulp.task('pre-build', function () {

	return del([

		"../dist/**"

	], { force: true });

});



gulp.task('build', ['build-tmp', 'pre-build'], function (done) {
    //
	// gulp.src([
    //
	// 	'dist/README.md',
    //
	// 	'dist/package.json',
    //
	// 	'dist/index.es6.js',
    //
	// 	'dist/index.es5.js',
    //
	// 	'dist/public_api.js',
    //
	// 	'dist/index.metadata.json',
    //
	// 	'dist/bundles/**.js',
    //
	// 	'dist/**/*.d.ts',
    //
	// 	'!../src/app/**/*.spec.ts'
    //
	// ], { base: 'dist' })
    //
	// 	.pipe(gulp.dest('../dist'))
    //
	// 	.on('end', function () {
    //
	// 		// del('dist/**', { force: true }).then(function () {
     //        //
	// 		// 	done();
     //        //
	// 		// });
    //
	// 	});

});
//
//
//
//
//
// gulp.task('git-init', function (done) {
//
// 	if (publishPath != null) {
//
// 		process.chdir(publishPath);
//
// 		git.init({ args: '--quiet' }, function (err) {
//
// 			if (err) throw err;
//
// 			done();
//
// 		});
//
// 	}
//
// });
//
//
//
// gulp.task('git-add', function () {
//
// 	if (publishPath != null) {
//
// 		process.chdir(publishPath);
//
// 		return gulp.src(path.join(publishPath, '**/*'))
//
// 			.pipe(git.add());
//
// 	}
//
// });
//
//
//
// gulp.task('git-commit', function () {
//
// 	if (publishPath != null) {
//
// 		process.chdir(publishPath);
//
// 		return gulp.src(path.join(publishPath, '**/*'))
//
// 			.pipe(git.commit(`v${pkg.version}`));
//
// 	}
//
// });
//
//
//
// gulp.task('git-tag', function (done) {
//
// 	if (publishPath != null) {
//
// 		process.chdir(publishPath);
//
// 		git.tag(pkg.version, `v${pkg.version}`, function (err) {
//
// 			if (err) throw err;
//
// 			done();
//
// 		});
//
// 	}
//
// });
//
//
//
// gulp.task('version', [], function (done) {
//
// 	if (publishPath != null) {
//
// 		runSequence('git-init', 'git-add', 'git-commit', 'git-tag', done);
//
// 	}
//
// });
//
//
//
// gulp.task('pre-publish', function () {
//
// 	if (publishPath != null) {
//
// 		var delPath = path.join(publishPath, '**/*');
//
// 		return del(delPath, { force: true });
//
// 	}
//
// });
//
//
//
// gulp.task('publish', ['pre-publish'], function () {
//
//
//
// 	if (publishPath != null) {
//
// 		var srcPath = path.resolve('../');
//
// 		return gulp.src([
//
// 			path.join(srcPath, 'dist/**/*')
//
// 		], { base: path.join(srcPath, 'dist') })
//
// 			.pipe(gulp.dest(publishPath));
//
// 	}
//
// 	return [];
//
// });
//
//
//
// // gulp.task('publish-clean', function () {
// //
// // 	if (publishPath != null) {
// //
// // 		return del([
// //
// // 			publishPath
// //
// // 		], { force: true });
// //
// // 	}
// //
// // });
//
//
//
// // gulp.task('publish-npm', function (done) {
// //
// // 	if (publishPath != null) {
// //
// // 		process.chdir(publishPath);
// //
// // 		gulp.src('package.json')
// //
// // 			.pipe(shell(['npm publish']))
// //
// // 			.on('end', function () {
// //
// // 				done();
// //
// // 			});
// //
// // 	}
// //
// // });
//
// // gulp.task('name-module', function () {
// //
// // 	var name = options.name;
// //
// // 	var modifyPackageJson =
// //
// // 		gulp.src([ '../package.json' ])
// //
// // 			.pipe(jsonModify({
// //
// // 				key: 'name',
// //
// // 				value: name
// //
// // 			}))
// //
// // 			.pipe(jsonModify({
// //
// // 				key: 'main',
// //
// // 				value: `dist/bundles/${name}.umd.js`
// //
// // 			}))
// //
// // 			.pipe(gulp.dest('../'));
// //
// //
// //
// // 	var modifyTsconfigJson =
// //
// // 		gulp.src(['./tsconfig.ngc.json'])
// //
// // 			.pipe(jsonModify({
// //
// // 				key: 'angularCompilerOptions.flatModuleId',
// //
// // 				value: name
// //
// // 			}))
// //
// // 			.pipe(gulp.dest('./'));
// //
// //
// //
// // 	// var modifyAppModule =
// //
// // 	//     gulp.src('../src/app/app.module.ts')
// //
// // 	//         .pipe(replace('AppModule', toPascalCase(name + 'Module')))
// //
// // 	//         .pipe(gulp.dest('../src/app'));
// //
// //
// //
// // 	// var modifyWebpack =
// //
// // 	//     gulp.src('../webpack.config.js')
// //
// // 	//         .pipe(replace('#AppModule', '#' + toPascalCase(name + 'Module')))
// //
// // 	//         .pipe(gulp.dest('../'));
// //
// //
// //
// // 	return [
// //
// // 		modifyPackageJson,
// //
// // 		modifyTsconfigJson,
// //
// // 		//modifyAppModule,
// //
// // 		//modifyWebpack
// //
// // 	];
// //
// //
// //
// // });
//
// // gulp.task('base-tag', function () {
// //
// //
// //
// // 	return gulp.src('../dist/index.html')
// //
// // 		.pipe(replace(RegExp("<base href=\"(.*)\""), `<base href=\"${options.href}\"`))
// //
// // 		.pipe(gulp.dest('../dist'));
// //
// // });
//
//
//
//
//
// gulp.task('es6-plato', ['compile-es6'], function () {
//
//
//
// 	let src = './dist/**/*.js';
//
// 	let outputDir = '../dist/metrics';
//
//
//
// 	let complexityRules = {
//
// 	};
//
//
//
// 	let platoArgs = {
//
// 		title: 'Code Metrics',
//
// 		eslint: eslintRules,
//
// 		complexity: complexityRules
//
// 	};
//
//
//
// 	function callback(reports) {
//
// 		let overview = plato.getOverviewReport(reports);
//
//
//
// 		let {
//
// 			total,
//
// 			average
//
// 		} = overview.summary;
//
//
//
// 		let output = `total
//
//           ----------------------
//
//           eslint: ${total.eslint}
//
//           sloc: ${total.sloc}
//
//           maintainability: ${total.maintainability}
//
//           average
//
//           ----------------------
//
//           eslint: ${average.eslint}
//
//           sloc: ${average.sloc}
//
//           maintainability: ${average.maintainability}`;
//
//
//
// 		console.log(output);
//
// 	}
//
//
//
// 	return plato.inspect(src, outputDir, platoArgs, callback);
//
//
//
// });
// //
// // gulp.task('default', ['build'], function(){});
