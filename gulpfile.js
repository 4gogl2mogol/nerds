'use strict';
const gulp = require('gulp');
//подключить browser-sync
//метод create означает создание экземпляра сервера
const browserSync = require('browser-sync').create();
const less = require('gulp-less');
const del = require('del');
const prettyHtml = require('gulp-pretty-html');
const sourcemaps = require('gulp-sourcemaps');
//соединяет в один несколько файлов
const concat = require('gulp-concat');
//минимизация файлов-изображений
const imageMin = require('gulp-imagemin');
//передает в папку назначения только более новые исходные файлы
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

//массив путей к js файлам
let jsFiles = [
    'app/js/1.js'
];
//массив путей к less-файлам
let lessFiles = [
    'app/less/styles.less',
    'app/less/normalize.less'
];

//локальный web-сервер
gulp.task('serve', function() {
    //метод init запускает сервер
    browserSync.init({
        //поднимает статический сервер
        server: {
            //отдает файлы из заданной дирестории
            baseDir: 'build',
            //открывать список файлов из baseDir: 'build'
            directory: true
        },
        //Открывать в firefox,
        //можно задать массив ['google chrome', 'firefox']
        browser: 'firefox'
    });
    //обзор файловой системы на предмет изменения файлов
    browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});

//очистка папки build
gulp.task('clean', function () {
    return del('build');
});

//копировать html-файлы из app в build
gulp.task('html', function () {
    return gulp.src('app/html/*.html')
        //форматирует html
        .pipe(prettyHtml({
            // отступы
            indent_size: 2,
            //Список тегов, которые должны иметь дополнительную новую строку перед ними.
            extra_liners: [],
            //символ отступа пробел
            indent_char: ' ',
            //максимальное количество символов в строке
            wrap_line_length: 120
        }))
        .pipe(gulp.dest('build'))
        .on('end', browserSync.reload);
});

//из app/fonts в build/fonts
gulp.task('fonts', function () {
    return gulp.src('app/fonts/*.*')
        .pipe(gulp.dest('build/fonts'));
});

//Из app/less в build/css
gulp.task('less', function () {
    return gulp.src(lessFiles)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2,
            format: 'beautify'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

//оптимизировать и копировать файлы изображений из app в build
gulp.task('img', function () {
    return gulp.src('app/img/**/*.*')
        .pipe(newer('build/img'))
        .pipe(imageMin())
        .pipe(gulp.dest('build/img'))
});

//конкатенация js-файлов
gulp.task('js', function () {
    return gulp.src(jsFiles)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'));
});

//watcher
gulp.task('watch', function () {
    gulp.watch('app/html/*.html', gulp.series('html'));
    gulp.watch('app/less/**/*.less', gulp.series('less'));
    gulp.watch('app/js/**/*.js', gulp.series('js'));
    gulp.watch('app/img/**/*.*', gulp.series('img'));
    gulp.watch('app/fonts/*.*', gulp.series('fonts'));
});

//Собирает проект в папку build
gulp.task('default', gulp.series('clean',
    gulp.parallel('html', 'less', 'js', 'img', 'fonts'),
    gulp.parallel('watch', 'serve')
));
//Запускать gulp gulp.parallel('watch', 'serve')

