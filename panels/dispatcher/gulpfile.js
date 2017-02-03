var gulp = require('gulp'),
	rollup = require('gulp-better-rollup'),
	babel = require('rollup-plugin-babel'),
	browserify = require('gulp-browserify');

gulp.task('default', function() {

	var comp = rollup({
		plugins: [babel({presets: ['react', 'es2015-rollup']})],
		format: 'iife'
	}, {});

	gulp.src('src/main.js')
	.pipe(comp)
	.pipe(browserify())
	.pipe(gulp.dest('../www/res/dispatcher'));
});
