var gulp = require('gulp'),
    compass = require('gulp-compass'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    fs = require('fs');

gulp.task('compile', function () {
    return [
        gulp.src('scss/*.scss')
        .pipe(compass({
            css: 'css',
            sass: 'scss',
            environment: 'development',
            sourcemap: true,
            encoding: 'utf-8',
            style: 'expanded'
        }))
        .on('error', function(error) {
            console.log(error);
            this.emit('end');
        })
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('/tmp'))
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
