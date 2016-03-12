var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-cssmin'),
    htmlmin = require('gulp-html-minifier'),
    image = require('gulp-image'),
    useref = require('gulp-useref'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload'),
    wrap = require('gulp-wrap'),
    connect = require('gulp-connect'),
    print = require('gulp-print'),
    gutil = require('gulp-util'),
    folderName = 'dev';


gulp.task('js', function(){
   var libs = [
      folderName + '/js/index/lib/angular.min.js',
      folderName + '/js/index/lib/angular-ui-router.min.js'
      ];
   var main = [folderName + '/js/index/*.js'];
   var stuff = [
      folderName + '/js/index/ctrls/**/*.js',
      folderName + '/js/index/directives/**/*.js',
      folderName + '/js/index/filters/**/*.js',
      folderName + '/js/index/services/**/*.js'
   ]
   var x = libs.concat(main, stuff);
   console.log(x);
   gulp.src(x)
   .pipe(print())
   // .pipe(jshint())
   // .pipe(jshint.reporter('default'))
   .pipe(concat('script.js'))
   .pipe(wrap('(function(){<%= contents %>})()'))
   .pipe(gulp.dest('build/js/index'));

   gulp.src(folderName + '/js/login/**/*.js')
   // .pipe(jshint())
   // .pipe(jshint.reporter('default'))
   .pipe(concat('script.js'))
   .pipe(wrap('(function(){<%= contents %>})()'))
   .pipe(gulp.dest('build/js/login'));
});

gulp.task('css', function(){
   gulp.src(folderName + '/css/index/**/*.css')
   .pipe(concat('style.css'))
   .pipe(autoprefixer('last 2 versions'))
   .pipe(cssmin())
   .pipe(gulp.dest('build/css/index'));

   gulp.src(folderName + '/css/login/**/*.css')
   .pipe(concat('style.css'))
   .pipe(autoprefixer('last 2 versions'))
   .pipe(cssmin())
   .pipe(gulp.dest('build/css/login'));
});

gulp.task('html', function(){
   gulp.src(folderName + '/**/*.html')
   // .pipe(htmlmin({collapseWhitespace: true, ignoreCustomFragments: true}))
   .pipe(gulp.dest('build/'));
});

gulp.task('jade', function(){
   gulp.src(folderName + '/**/*.jade')
   .pipe(gulp.dest('build/'));
});

gulp.task('images', function(){
   gulp.src(folderName + '/img/**/*')
   .pipe(image())
   .pipe(gulp.dest('build/img'));
});

gulp.task('useref', function(){
   gulp.src(folderName + '/js/**/*.js')
   .pipe(useref())
   .pipe(gulp.dest('build/js'));
});

gulp.task('watch', function(){
   gulp.watch(folderName + '/js/**/*.js', ['js']);
   gulp.watch(folderName + '/css/**/*.css', ['css']);
   gulp.watch(folderName + '/partials/*.html', ['html']);
   gulp.watch(folderName + '/*.jade', ['jade']);
});

gulp.task('connect', function(){
    connect.server({
        root: 'app',
        livereload: true
    });
});

gulp.task('default', ['js', 'css', 'html', 'images', 'jade', 'watch']);