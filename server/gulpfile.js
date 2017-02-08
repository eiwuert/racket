var gulp = require('gulp');
var exec = require('child_process').exec;

/*
 * Watches for source changes and builds the server
 */
gulp.task('default', function() {
	gulp.watch('src/**/*.php', ['build']);
});

/*
 * Builds the server
 */
gulp.task('build', function() {
	exec('./build.sh', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});
