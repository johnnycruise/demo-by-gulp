'use strict';
var gulp = require('gulp'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    htmlmin = require('gulp-minify-html'),
    cssmin = require('gulp-clean-css'),
	autoprefixer = require('gulp-autoprefixer'),
	plumber = require('gulp-plumber'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
	gulpPngquant = require('gulp-pngquant'),
	cache = require('gulp-cache'),
	inject = require('gulp-inject'),
	size = require('gulp-size'),
	notify = require('gulp-notify');

var htmlSrc = './src/*.html',
	htmlInc = './src/inc/*.html',
	cssSrc = './src/styles/*.css',
	jsSrc = './src/scripts/*.js',
	imgSrc = './src/**/*.+(jpg|jpeg|png|gif|svg|gif|bmp)',
	cssDist = './dist/styles/',
	jsDist = './dist/scripts',
	htmlDist = './dist/';

// 清除 dist 文件夹
gulp.task('del', function () {
    return del.sync('./dist');
});



// Html 整合
gulp.task('html', function () {
	
    return gulp.src(htmlSrc)
    .pipe(plumber())
    .pipe(fileinclude())
    .pipe(htmlmin({
			removeComments: true, //清除HTML注释
			collapseWhitespace: true, //压缩HTML
			collapseBooleanAttributes: true, //省略布尔属性的值
			removeEmptyAttributes: false, //删除所有空格作属性值
			removeScriptTypeAttributes: false, // 删除<script>的type="text/javascript"
			removeStyleLinkTypeAttributes: false, // 删除<style>和<link>的type="text/css"
			minifyJS: true, // 压缩页面JS
			minifyCSS: true // 压缩页面CSS
		}))
    .pipe(gulp.dest(htmlDist))
    .pipe( notify({ message: "HTML tasks have been completed!"}) )
});

// Css 整合
gulp.task('styles', function() {
	return gulp.src(cssSrc)
		.pipe(plumber())
//		.pipe(rubySass({style:'expanded',precision:10}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions','safari 5','ios 7','android 4'],
			cascade: false
		}))
//		.pipe(concat('main.css'))
		.pipe(cssmin())
		.pipe(gulp.dest('./dist/styles'))
    	.pipe( notify({ message: "Styles tasks have been completed!"}) )
});

// Js 整合
gulp.task('scripts',function(){
	return gulp.src(jsSrc)
		.pipe(plumber())
		.pipe(uglify())
		.pipe(gulp.dest('./dist/scripts'))
    	.pipe( notify({ message: "Scripts tasks have been completed!"}) )
});


// Image 整合
gulp.task('imagemin', function() {
	gulp.src(imgSrc)
		.pipe(cache(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.svgo({	plugins: [{	removeViewBox: false}],use: [gulpPngquant()]})
		])))
		.pipe(gulp.dest('./dist/'))
    	.pipe( notify({ message: "Imagemin tasks have been completed!"}) )
});

// 配置服务器
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        port: 8000,
        notify:true,
    });
    // 监听
    gulp.watch([htmlSrc,htmlInc], ['html']).on('change', reload);
    gulp.watch(imgSrc,['imagemin']).on('change',reload);
    gulp.watch(cssSrc, ['styles']).on('change', reload);
    gulp.watch(cssDist).on('change',reload);
    gulp.watch(jsSrc, ['scripts']).on('change', reload);
});

gulp.task('default', ['del','styles','scripts','html', 'imagemin', 'serve']);

gulp.task('build', function() {
	return gulp.src('./dist/**/*').pipe(size({title:'build',gzip:true}))
});
