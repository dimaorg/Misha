'use strict';

const { task, src, dest, series, watch } = require('gulp');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const minify = require('gulp-csso');
const rename = require('gulp-rename');
const sourcemap = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const { optipng, jpegtran, svgo } = require('gulp-imagemin');
const jsmin = require('gulp-jsmin');
const htmlmin = require('gulp-html-minifier');
const del = require('del');
const server = require('browser-sync');
const webp = require('gulp-webp');

task('html', function () {
  return src('source/*.html')
    .pipe(posthtml(
      [include()]
    ))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(dest('build'));
});

task('css', function () {
  return src('source/less/style.less')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(dest('build/css'));
});

task('js', function () {
  return src('source/js/app.js')
    .pipe(jsmin())
    .pipe(rename('app.min.js'))
    .pipe(dest('build/js'));
});

task('img', function () {
  return src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      optipng({optimizationLevel: 3}),
      jpegtran({progressive: true}),
      svgo()
    ]))
    .pipe(dest('build/img'));
});

task('webp', function () {
  return src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(dest('build/img'));
});

task('copy', function () {
  return src([
    'source/fonts/**/*.{woff,woff2}'
  ], {
    base: 'source'
  })
    .pipe(dest('build'));
});

task('del', function () {
  return del('build');
});

task('refresh', function (done) {
  server.reload();
  done();
});

task('server', function () {
  server.init({
    server: 'build/'
  });
  watch('source/*.html', series('html', 'refresh'));
  watch('source/less/**/*.less', series('css', 'refresh'));
  watch('source/js/app.js', series('js', 'refresh'))
});

task('build', series(
  'del',
  'copy',
  'html',
  'css',
  'js',
  'img',
  'webp'
));

task('start', series('build', 'server'));
