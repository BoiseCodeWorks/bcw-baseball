var
  args = require('yargs').argv,
  gulp = require('gulp'),
  path = require('path'),
  del = require('del'),
  concat = require('gulp-concat'),
  expectFile = require('gulp-expect-file'),
  less = require('gulp-less'),
  htmlPrettify = require('gulp-html-prettify'),
  ngAnnotate = require('gulp-ng-annotate'),
  util = require('gulp-util'),
  gulpIf = require('gulp-if'),
  uglify = require('gulp-uglify'),
  filter = require('gulp-filter'),
  stylus = require('gulp-stylus'),
  babel = require('gulp-babel'),
  browserSync = require('browser-sync').create();

var gulpsync = require('gulp-sync')(gulp);

var useStylus = true;
var useCache = false;

var src = "./src";
var dest = "./app";

var source = {
  js: [src + '/**/*.js'],
  html: src + '/**/*.html',
  css: [src + '/app.+(less|styl|css)'],
  assets: src + '/assets/**/*.*',
}

var build = {
  js: dest + '/js',
  html: dest + '/',
  css: dest + '/css',
  assets: dest + '/assets'
}

// VENDOR CONFIG
var vendor = {
  // vendor scripts required to start the app
  base: {
    source: require('./vendor.base.json'),
  },
};

var injectOptions = {
  name: 'templates',
  transform: function(filepath) {
    return 'script(src=\'' +
      filepath.substr(filepath.indexOf('app')) +
      '?v=\'+build)';
  }
}

// VENDOR BUILD
gulp.task('vendor', gulpsync.sync(['vendor:base']));

// Build the base script to start the application from vendor assets
gulp.task('vendor:base', function() {
  log('Copying base vendor assets..');

  var jsFilter = filter('**/*.js', {
    restore: true
  });
  var cssFilter = filter('**/*.css', {
    restore: true
  });

  return gulp.src(vendor.base.source)
    .pipe(expectFile(vendor.base.source))
    .pipe(jsFilter)
    .pipe(concat("vendor.js"))
    .pipe(gulp.dest(build.js))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(concat("vendor.css"))
    .pipe(gulp.dest(build.css));
});



////ASSETS
// APP IMAGES
gulp.task('assets', function() {
  log("Copying application images..");
  gulp.src(source.assets)
    .pipe(gulp.dest(build.assets));
});

// APP LESS
gulp.task('css', function() {
  log('Building application styles..');
  return gulp.src(source.css)
    .pipe(useStylus ? stylus() : less())
    .on('error', handleError)
    .pipe(gulp.dest(build.css));
});

// JADE
gulp.task('html', function() {
  log('Building views.. ' + (useCache ? 'using cache' : ''));
  return gulp.src(source.html)
    .pipe(htmlPrettify(prettifyOpts))
    .pipe(gulp.dest(build.html));
});

//JS 
gulp.task('js', function() {
  log('Building scripts..');
  return gulp.src(source.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .on('error', handleError)
    .pipe(gulp.dest(build.js));
});

gulp.task('appfiles', [
  'assets',
  'js',
  'css',
  'html'
]);


// Remove all files from the build paths
gulp.task('clean', function(done) {
  var delconfig = [].concat(
    build.js,
    build.css,
    build.html,
    build.assets
  );

  log('Cleaning: ' + util.colors.blue(delconfig));
  // force: clean files outside current directory
  return del(delconfig, {
    force: true
  }, done);
});


// use default task to launch Browsersync and watch JS files
gulp.task('live', function() {
  // Serve files from the root of this project
  browserSync.init({
    ghostMode: false,
    notify: false,
    server: {
      baseDir: dest
    }
  });

  gulp.watch(source.js, ['js-reload']);
  gulp.watch(watches.css, ['css-reload']);
  gulp.watch(source.html, ['html-reload']);
  gulp.watch(source.assets, ['assets-reload']);
});


var watches = {
  css: [src + '/*.+(less|styl|css)', src + '/**/*.+(less|styl|css)']
}

gulp.task('js-reload', ['js'], function() { browserSync.reload(); });
gulp.task('css-reload', ['css'], function() { browserSync.reload(); });
gulp.task('html-reload', ['html'], function() { browserSync.reload(); });
gulp.task('assets-reload', ['assets'], function() { browserSync.reload(); });


//////////////////////////////////////
//           MAIN TASKS
//
//////////////////////////////////////

// default (no minify)
gulp.task('default', gulpsync.sync([
  'clean',
  'vendor',
  'appfiles',
]), function() {

  log('******************');
  log('* Build Complete *');
  log('******************');
});


// default (no minify)
gulp.task('serve', gulpsync.sync([
  'default',
  'live'
]), function() {

  log('************');
  log('* All Done * You can start editing your code, LiveReload will update your browser after any change..');
  log('************');
});



// PLUGINS OPTIONS

var prettifyOpts = {
  indent_char: ' ',
  indent_size: 3,
  unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u', 'pre', 'code']
};

var vendorUglifyOpts = {
  mangle: {
    except: ['$super'] // rickshaw requires this
  }
};


// log to console using
function log(msg) {
  util.log(util.colors.blue(msg));
}

// Error handler
function handleError(err) {
  log(err.toString());
  this.emit('end');
}