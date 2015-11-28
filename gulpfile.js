var gulp = require('gulp');

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');
var browserSync = require('browser-sync');
var tslint = require('gulp-tslint');
var superstatic = require('superstatic');

var config = {
  publicPath: __dirname + '/src/dist',
  app: {
    path: __dirname + '/src/app',
    main: 'index.ts',
    result: 'application.js'
  }
};

gulp.task('ts-lint', function () {
  return gulp.src(config.app.path + '/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('prose'));
});

gulp.task('compile-js', function() {
  var bundler = browserify({basedir: config.app.path})
    .add(config.app.path + '/' + config.app.main)
    .plugin(tsify, {target: 'ES5'});

  return bundler.bundle()
    .pipe(source(config.app.result))
    .pipe(gulp.dest(config.publicPath));
});

gulp.task('watch', function() {
    gulp.watch([config.app.path + '/**/*.ts'], ['ts-lint', 'compile-js']);
});

gulp.task('serve', ['compile-js', 'watch'], function() {
  process.stdout.write('Serving...\n');
  browserSync({
    port: 3000,
    files: ['index.html', '**/*.js'],
    injectChanges: true,
    logFileChanges: false,
    logLevel: 'silent',
    logPrefix: 'dhgen',
    notify: true,
    reloadDelay: 1000,
    server: {
      baseDir: './src',
      //middleware: superstatic({debug: true})
    }
  });
});

gulp.task('default', ['ts-lint', 'compile-js']);
