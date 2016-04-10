var gulp = require('gulp'),
    compass = require('gulp-compass'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs');

gulp.task('compile', function () {
    return [
        gulp.src('scss/*.scss')
        .pipe(compass({
            css: 'css',
            sass: 'scss',
            environment: 'development',
            sourcemap: true,
            style: 'expanded'
        }))
        .pipe(gulp.dest('/tmp/aaronhipple-scss'))
    ]
})

gulp.task('watch', function () {
    var watcher = gulp.watch(
        [
            'js/*.js',
            'scss/*.scss'
        ], ['compile']
    );
})
