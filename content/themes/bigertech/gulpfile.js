var gulp = require('gulp'),
		less = require('gulp-less'),
		cssmin = require('gulp-cssmin'),
		jshint = require('gulp-jshint'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		imagemin = require('gulp-imagemin'),
		cache = require('gulp-cache'),
		rename = require('gulp-rename'),
		sourcemaps = require('gulp-sourcemaps'),
		clean = require('gulp-clean'),
		notify = require('gulp-notify');


// 设置路径
var defaultPath = './assets/',
	  destPath = defaultPath + 'dist/';

var paths = {
	less: defaultPath + 'less/main.less',
	less_dist: destPath + 'css/',

	scripts: defaultPath + 'js/*.js',
	scripts_dist: destPath + 'js/',

	images: defaultPath + 'images/*',
	images_dist: destPath + 'images/'
};


// 清理开发时不需要的文件
gulp.task('clean', function() {
	return gulp.src(destPath, {read: false})
	.pipe(clean());
});


// 将 Less 转换成 CSS，以及压缩 CSS
gulp.task('less', function() {
	return gulp.src(paths.less)
	.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(cssmin())
		.pipe(rename('bigertech.min.css'))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(paths.less_dist))
	.pipe(notify({ message: 'Less task complete' }));
});


// 验证、合并、压缩 js 文件
gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
	.pipe(sourcemaps.init())
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(concat('bigertech.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
	.pipe(gulp.dest(paths.scripts_dist))
	.pipe(notify({ message: 'Scripts task complete' }));
});


// 压缩图片
gulp.task('images', function() {
	return gulp.src(paths.images)
	.pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
	.pipe(gulp.dest(paths.images_dist))
	.pipe(notify({ message: 'Images task complete' }));
});


// 默认监测所有前端开发文件的变化
gulp.task('watch', function() {
	gulp.watch(paths.less, ['less']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.images, ['images']);
});

// 默认 gulp 任务
gulp.task('default', ['clean', 'watch', 'less', 'scripts', 'images']);
