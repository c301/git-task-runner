var gulp = require('gulp');
var notify = require("gulp-notify");
var jshint = require('gulp-jshint');
var map = require('map-stream');
var mocha = require('gulp-mocha');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');

gulp.task('lint', function() {
    var notyReporter = map(function (file, cb) {
    if (!file.jshint.success) {
        var err = file.jshint.results[0];
        if (err) {
            var message = ' '+file.path + ': line ' + err.error.line + ', col ' + err.error.character + ', ' + err.error.reason;
            gulp.src("./src/index.js")
            .pipe(notify(message));
        }
    }
    cb(null, file);
    });

    return gulp
    .src(['gulpfile.js', 'src/*.js', 'test/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(notyReporter);
});

gulp.task('test', function() {
    function handleError(err) {
        gulp.src("./src/index.js")
        .pipe(notify(err.message));
    }
    return gulp.src('test/index.test.js')
    .pipe(plumber({
        errorHandler: handleError
    }))
    .pipe(mocha());
});


gulp.task('default', ['lint', 'test'], function() {
    gulp.watch(['src/*.js', 'test/*.js'], ['lint', 'test']);
});
