// const fs = require('fs')
const gulp = require('gulp');
const del = require('del');
const path = require('path')
const inlineNg2Template = require('gulp-inline-ng2-template');
const ngc = require('@angular/compiler-cli/src/main').main;
const less = require('less');
const gulpSequence = require('gulp-sequence');

const inlineTemplatePluginOptions = {
	base: './src',
	useRelativePaths: true,
	styleProcessor: (path, ext, file, cb) => {
		less.render(file, {paths: ['../../@ansyn/']}, (e, out) => {
			if (e) {
				throw e;
			}
			cb(null, out.css);
		});
	}
};

gulp.task('clean', function () {
	return del([
		"src/**"
	], {force: true});
});

gulp.task('copy-src', function () {
	// and compile less to css
	return gulp.src([
		'../**/*.ts',
		'!../build/**/*.ts',
		'!../**/*.spec.ts'
	])
	.pipe(inlineNg2Template(inlineTemplatePluginOptions))
	.pipe(gulp.dest('src'))

});

gulp.task('compile', function () {
	return ngc(['-p', 'tsconfig.imagery.json']);
});

gulp.task('default', (done) => {
	gulpSequence('clean', 'copy-src', 'compile', () => {
		return done();
	});
});
