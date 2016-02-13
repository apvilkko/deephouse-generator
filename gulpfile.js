var gulp = require('gulp');

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');
var browserSync = require('browser-sync');
var tslint = require('gulp-tslint');
var domain = require('domain');
var tap = require('gulp-tap');
var streamify = require('gulp-streamify');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');

var config = {
  publicPath: __dirname + '/src/dist',
  revved: __dirname + '/src/dist/dist',
  app: {
    path: __dirname + '/src/app',
    main: 'index.ts',
    result: 'application.js'
  }
};

/*function handleError(error) {
  console.log(error);
  this.emit('end');
}*/

gulp.task('ts-lint', function () {
  return gulp.src(config.app.path + '/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('prose'));
});

gulp.task('compile-js', function() {
  var bundler = browserify({basedir: config.app.path})
    .add(config.app.path + '/' + config.app.main)
    .plugin(tsify, {target: 'ES5'})
    ;

  return bundler.bundle()
    .pipe(source(config.app.result))
    .pipe(gulp.dest(config.publicPath));
});

gulp.task('copyworker', function() {
  gulp.src(config.app.path + '/worker.js')
    .pipe(gulp.dest(config.publicPath));
});

gulp.task('copyworker:dist', function() {
  gulp.src(config.app.path + '/worker.js')
    .pipe(gulp.dest(config.revved));
});


gulp.task('scripts', function() {
    gulp.src(config.app.path + '/' + config.app.main, {read: false})
        .pipe(tap(function(file) {
            var d = domain.create();

            d.on("error", function(err) {
                gutil.log(
                    gutil.colors.red("Browserify compile error:"),
                    err.message,
                    "\n\t",
                    gutil.colors.cyan("in file"),
                    file.path
                );
            });

            d.run(function() {
                file.contents = browserify({
                    basedir: config.app.path,
                    entries: [file.path]
                })
                //.add(es6ify.runtime)
                //.add(config.app.path + '/' + config.app.main)
                //.transform(hbsfy)
                //.transform(es6ify.configure(/^(?!.*node_modules)+.+\.js$/))
                //.transform(bulkify)
                //.transform(aliasify)
                .plugin(tsify, {target: 'ES5'})
                .bundle();
            });
        }))
        //.pipe(streamify(concat(config.app.result)))
        .pipe(streamify(concat(config.app.result)))
        .pipe(gulp.dest(config.publicPath));
});

gulp.task('watch', function() {
    gulp.watch([config.app.path + '/**/*.ts'], ['ts-lint', 'scripts', 'copyworker']);
});

gulp.task('serve', ['ts-lint', 'scripts', 'copyworker', 'watch'], function() {
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
      baseDir: './src'
    }
  });
});

gulp.task('revjs', () => {
  return gulp.src(config.publicPath + '/' + config.app.result)
    .pipe(rev())
    .pipe(gulp.dest(config.revved))
    .pipe(rev.manifest())
    .pipe(gulp.dest(config.revved));
});

gulp.task('copyhtml', () => {
  gulp.src(config.app.path + '../../index.html')
    .pipe(revReplace({manifest: gulp.src(config.revved + '/rev-manifest.json')}))
    .pipe(gulp.dest(config.publicPath));
});

gulp.task('dist', ['ts-lint', 'scripts', 'copyworker:dist', 'revjs', 'copyhtml']);

gulp.task('default', ['dist']);
