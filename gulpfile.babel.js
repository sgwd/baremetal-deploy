import fs from "fs";
import path from "path";
import { src, dest, watch, parallel, series } from "gulp";
import { exec } from "child_process";
import { create as browserSyncCreate } from "browser-sync";
import run from "gulp-run-command";
import concat from "gulp-concat";
import terser from "gulp-terser";

const browserSync = browserSyncCreate();

const path404 = path.join(__dirname, "output/404.html");
const content_404 = () =>
  fs.existsSync(path404) ? fs.readFileSync(path404) : null;

const cleanOutput = () => exec("rm -rf outout/");

const buildContent = () => exec("utils/build.sh");

const reload = (cb) => {
  browserSync.init(
    {
      ui: {
        port: 9002,
      },
      server: {
        baseDir: "output",
        serveStaticOptions: {
          extensions: ["html"],
        },
      },
      files: "output/*.html",
      port: 9001,
    },
    (_, bs) => {
      bs.addMiddleware("*", (_, res) => {
        res.write(content_404());
        res.end();
      });
    }
  );
  cb();
};

const watchFiles = () => {
  watch(["documentation/**"], { ignoreInitial: false }, buildAll);
};

const buildAll = series(buildContent);

const build = series(cleanOutput, buildContent);
exports.build = build;

const deploy = series(build, parallel(watchFiles, reload));
exports.deploy = deploy;
exports.default = deploy;
