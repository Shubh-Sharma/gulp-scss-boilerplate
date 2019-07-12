const { series, parallel, src, dest, watch } = require('gulp');
const { exec } = require('child_process');
const rename = require('gulp-rename');
const fs = require('fs');
const path = require('path');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
sass.compiler = require('node-sass');


const _buildDir = 'build';

function clean(cb) {
  // clean the build directory
  console.log("[clean]");
  exec('cd build && rm -r *');

  fs.readdir(_buildDir, function(error, files) {
    // unlink files here
    if (error) console.log("[error reading files]");

    for (let file of files) {
      fs.unlink(path.join(_buildDir, file), function(err) {
        if (err) console.log("[error deleting file]");
      });
    }
  });

  cb();
}

function defaultTask(cb) {
  console.log("[default]");
  browserSync.init({
    server: _buildDir
  });
  return watch(['*.html', 'css/*.scss'], parallel(html, css)).on('change', browserSync.reload);
}

function html() {
  console.log("[build] html");
  return src("index.html")
    .pipe(dest(_buildDir))
    .pipe(browserSync.stream());
}

function css() {
  console.log("[build] css");
  return src("css/*.scss")
    .pipe(sass()).on('error', sass.logError)
    .pipe(rename({ extname: '.css' }))
    .pipe(dest(_buildDir + "/css"))
    .pipe(browserSync.stream());
}

exports.default = defaultTask;
exports.build = series(clean, parallel(html, css));
