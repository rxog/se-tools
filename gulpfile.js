import babelify from "babelify";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import gulp from "gulp";
import rename from "gulp-rename";
import source from "vinyl-source-stream";
import tsify from "tsify";
import uglify from "gulp-uglify";
import { deleteAsync } from "del";
const { series, dest, watch } = gulp;
const distPath = "dist";

function clean() {
  return deleteAsync([distPath]);
}

function bundle() {
  return browserify()
    .add("src/main.ts")
    .plugin(tsify)
    .transform(babelify, {
      presets: ["@babel/preset-env"],
      global: true,
      ignore: [],
    })
    .bundle()
    .pipe(source("tools.js"))
    .pipe(dest(distPath))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(dest(distPath));
}

function watchFiles() {
  watch("src/**/*.ts", bundle);
}

const build = series(clean, bundle);
const dev = series(build, watchFiles);

export { build, dev };
export default build;
