var gulp              = require('gulp');
var browserSync       = require('browser-sync');
var jshint            = require('gulp-jshint');

gulp.task('default', ['browser-sync', 'watch']);
gulp.task('build', ['js']);
gulp.task('js', ['jshint']);

gulp.task('watch', function () {
  gulp.watch('pdfcheck.js', ['js']);
});

gulp.task('browser-sync', ['build'], function() {
  browserSync({
    server: {baseDir: './'},
    host: '127.0.0.1',
    port: 4000
  });
});

gulp.task('jshint', function() {
  return gulp.src(['pdfcheck.js', 'gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});
