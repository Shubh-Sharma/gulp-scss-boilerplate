const { series, parallel, src, dest, watch } = require('gulp');
const { exec } = require('child_process');
const rename = require('gulp-rename');
const image=require('gulp-image');
const fs = require('fs');
const path = require('path');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
sass.compiler = require('node-sass');


const _buildDir = 'build';

function clean(cb) {
  // clean the build directory
  console.log("[clean]");
  // exec('cd build && rm -r *');

  // fs.readdir(_buildDir, function(error, files) {
  //   // unlink files here
  //   if (error) console.log("[error reading files]");
  //   console.log(files);
  //   for (let file of files) {
  //     fs.unlink(path.join(_buildDir, file), function(err) {
  //       if (err) console.log("[error deleting file]");
  //     });
  //   }
  // });

  var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recursive
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };
  deleteFolderRecursive(_buildDir);

  cb();
}


function _startBrowser(cb){
  console.log("[Starting Browser]");
  
  console.log("[Cleaned,scaffold created]");
  if(fs.existsSync(_buildDir)){
    browserSync.init({
      server: _buildDir
    });
    browserSync.reload();
  } else {
    console.log('[_builddir not built]');
  }
}

function defaultTask(cb) {
  console.log("[default]");
  var watcher=watch(['*.html', 'css/**/*.scss','assets/**/*.{png,jpg,jpeg,svg}'], parallel(html, scss, css, images));
  
  watcher.on('ready',series(clean, scaffold, parallel(html, scss, css, images),_startBrowser));
  watcher.on('change', browserSync.reload);
  
  
  console.log("watching");

  // return cb();
}


function html() {
  console.log("[build] html");
  return src("index.html")
    .pipe(dest(_buildDir))
    .pipe(browserSync.stream());
}

function scss() {
  console.log("[build] scss");
  return src("css/**/*.scss")
    .pipe(sass()).on('error', sass.logError)
    .pipe(rename({ extname: '.css' }))
    .pipe(dest(_buildDir + "/css"))
    .pipe(browserSync.stream());
}

function css() {
  console.log("[build] css");

  if(!fs.existsSync(_buildDir+'/css')){
    fs.mkdirSync(_buildDir+'/css'); 
  }

  return src("css/**/*.css")
    .pipe(dest(_buildDir + "/css"))
    .pipe(browserSync.stream());
}

function images() {
  console.log("[build] images");

  if(!fs.existsSync(_buildDir+'/assets')){
    fs.mkdirSync(_buildDir+'/assets'); 
  }

  return src("assets/**/*.{png,jpg,jpeg,svg}")
    .pipe(dest(_buildDir + "/assets"))
    .pipe(browserSync.stream());
}

function scaffold(cb){
  console.log("[scaffold]");
  if(!fs.existsSync(_buildDir)){
    console.log("[creating _builddir]");
    fs.mkdirSync(_buildDir);
    console.log("[_builddir created]");
  }

  if(!fs.existsSync(_buildDir+'/css')){
    fs.mkdirSync(_buildDir+'/css');
  }

  if(!fs.existsSync(_buildDir+'/assets')){
    fs.mkdirSync(_buildDir+'/assets');
  }

  cb();
}

exports.default = defaultTask;
exports.build = series(clean, scaffold, parallel(html, scss, css, images));

// 
//