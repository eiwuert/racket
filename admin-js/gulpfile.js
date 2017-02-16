const destinationDir = '../www/res/service';

var gulp = require('gulp'),
	rollup = require('gulp-better-rollup');
	//babel = require('rollup-plugin-babel'),
	//browserify = require('gulp-browserify');

gulp.task('default', function() {

	var comp = rollup({
		//plugins: [babel({presets: ['react', 'es2015-rollup']})],
		format: 'iife'
	}, {});

	gulp.src('src/*.js')
	.pipe(comp)
	//.pipe(browserify())
	.pipe(gulp.dest(destinationDir));
});

/*
 * Build the CSS file in the webdir
 */
//var less = require('gulp-less');
gulp.task('css', function() {
	gulp.src('dispatcher.less')
		.pipe(less())
		.pipe(gulp.dest(destinationDir));
});
