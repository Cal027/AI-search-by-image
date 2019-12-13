const path = require('path');
const {exec} = require('child_process');
const {lstatSync, readdirSync, readFileSync, writeFileSync} = require('fs');

const {ensureDirSync} = require('fs-extra');
const recursiveReadDir = require('recursive-readdir');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const svgmin = require('gulp-svgmin');
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const gulpif = require('gulp-if');
const del = require('del');
const jsonMerge = require('gulp-merge-json');
const jsonmin = require('gulp-jsonmin');
const svg2png = require('svg2png');
const imagemin = require('gulp-imagemin');
const sharp = require('sharp');

const targetEnv = process.env.TARGET_ENV || 'firefox';
const isProduction = process.env.NODE_ENV === 'production';
const distDir = path.join('dist', targetEnv);

gulp.task('clean', function() {
  return del([distDir]);
});

gulp.task('js:webpack', function(done) {
  exec('webpack-cli --display-error-details --bail --colors', function(
    err,
    stdout,
    stderr
  ) {
    console.log(stdout);
    console.log(stderr);
    done(err);
  });
});

gulp.task('js:babel', function(done) {
  gulp
    .src(['src/content/**/*.js'], {base: '.'})
    .pipe(babel())
    .pipe(gulp.dest(distDir));
  done();
});

gulp.task('js', gulp.parallel('js:webpack', 'js:babel'));

gulp.task('html', function(done) {
  gulp
    .src('src/**/*.html', {base: '.'})
    .pipe(gulpif(isProduction, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(distDir));
  done();
});

gulp.task('css', function(done) {
  gulp
    .src(
      [
        'src/select/frame.css',
        'src/select/pointer.css',
        'src/confirm/frame.css',
        'src/capture/frame.css',
        'src/content/engines/style.css'
      ],
      {
        base: '.'
      }
    )
    .pipe(postcss())
    .pipe(gulp.dest(distDir));
  done();
});

gulp.task('icons', async function(done) {
  ensureDirSync(`${distDir}/src/icons/app`);
  const iconSvg = readFileSync('src/icons/app/icon.svg');
  const appIconSizes = [16, 19, 24, 32, 38, 48, 64, 96, 128];
  for (const size of appIconSizes) {
    const pngBuffer = await svg2png(iconSvg, {width: size, height: size});
    writeFileSync(`${distDir}/src/icons/app/icon-${size}.png`, pngBuffer);
  }

  ensureDirSync(`${distDir}/src/icons/engines`);
  const pngPaths = await recursiveReadDir('src/icons/engines', ['*.!(png)']);
  const menuIconSizes = [16, 32];
  for (const pngPath of pngPaths) {
    for (const size of menuIconSizes) {
      await sharp(pngPath)
        .resize(size)
        .toFile(path.join(distDir, `${pngPath.slice(0, -4)}-${size}.png`));
    }
  }

  if (isProduction) {
    gulp
      .src(`${distDir}/src/icons/**/*.png`, {base: '.'})
      .pipe(imagemin())
      .pipe(gulp.dest('.'));
  }

  gulp
    .src('src/icons/@(browse|engines|modes|misc)/*.svg', {base: '.'})
    .pipe(gulpif(isProduction, svgmin()))
    .pipe(gulp.dest(distDir));
  gulp
    .src('node_modules/ext-contribute/src/assets/*.svg')
    .pipe(gulpif(isProduction, svgmin()))
    .pipe(gulp.dest(`${distDir}/src/contribute/assets`));
  done();
});

gulp.task('fonts', function(done) {
  gulp
    .src('src/fonts/roboto.css', {base: '.'})
    .pipe(postcss())
    .pipe(gulp.dest(distDir));
  gulp
    .src('node_modules/typeface-roboto/files/roboto-latin-@(400|500|700).woff2')
    .pipe(gulp.dest(`${distDir}/src/fonts/files`));
  done();
});

gulp.task('locale', function(done) {
  const localesRootDir = path.join(__dirname, 'src/_locales');
  const localeDirs = readdirSync(localesRootDir).filter(function(file) {
    return lstatSync(path.join(localesRootDir, file)).isDirectory();
  });
  localeDirs.forEach(function(localeDir) {
    const localePath = path.join(localesRootDir, localeDir);
    gulp
      .src(
        [
          path.join(localePath, 'messages.json'),
          path.join(localePath, `messages-${targetEnv}.json`)
        ],
        {allowEmpty: true}
      )
      .pipe(
        jsonMerge({
          fileName: 'messages.json',
          edit: (parsedJson, file) => {
            if (isProduction) {
              for (let [key, value] of Object.entries(parsedJson)) {
                if (value.hasOwnProperty('description')) {
                  delete parsedJson[key].description;
                }
              }
            }
            return parsedJson;
          }
        })
      )
      .pipe(gulpif(isProduction, jsonmin()))
      .pipe(gulp.dest(path.join(distDir, '_locales', localeDir)));
  });
  done();
});

gulp.task('manifest', function(done) {
  gulp
    .src('src/manifest.json')
    .pipe(
      jsonMerge({
        fileName: 'manifest.json',
        edit: (parsedJson, file) => {
          if (['chrome', 'opera'].includes(targetEnv)) {
            delete parsedJson.applications;
            delete parsedJson.browser_action.browser_style;
            delete parsedJson.options_ui.browser_style;
            const urlPatterns = parsedJson.content_scripts[0].matches;
            parsedJson.content_scripts[0].matches = urlPatterns.filter(
              item => item !== 'file:///*'
            );
          }

          if (['chrome', 'firefox'].includes(targetEnv)) {
            delete parsedJson.minimum_opera_version;
          }

          if (['firefox', 'opera'].includes(targetEnv)) {
            delete parsedJson.minimum_chrome_version;
          }

          if (targetEnv === 'firefox') {
            delete parsedJson.options_ui.chrome_style;
          }

          parsedJson.version = require('./package.json').version;
          return parsedJson;
        }
      })
    )
    .pipe(gulpif(isProduction, jsonmin()))
    .pipe(gulp.dest(distDir));
  done();
});

gulp.task('license', function(done) {
  let year = '2017';
  const currentYear = new Date().getFullYear().toString();
  if (year !== currentYear) {
    year = `${year}-${currentYear}`;
  }

  const notice = `Search by Image
Copyright (c) ${year} Armin Sebastian

This software is released under the terms of the GNU General Public License v3.0.
See the LICENSE file for further information.
`;

  writeFileSync(`${distDir}/NOTICE`, notice);
  gulp.src(['LICENSE']).pipe(gulp.dest(distDir));
  done();
});

gulp.task('copy', function(done) {
  gulp
    .src('node_modules/ext-contribute/src/assets/*.@(jpg|png)')
    .pipe(gulp.dest(`${distDir}/src/contribute/assets`));
  gulp.src(['src*/icons/**/*.@(jpg|png)']).pipe(gulp.dest(distDir));
  done();
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel(
      'js',
      'html',
      'css',
      'icons',
      'fonts',
      'locale',
      'manifest',
      'license'
    ),
    'copy'
  )
);

gulp.task('zip', function(done) {
  exec(
    `web-ext build -s dist/${targetEnv} -a artifacts/${targetEnv} --overwrite-dest`,
    function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      done(err);
    }
  );
});

gulp.task('inspect', function(done) {
  exec(
    `webpack --profile --json > report.json && webpack-bundle-analyzer report.json dist/firefox/src && sleep 10 && rm report.{json,html}`,
    function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      done(err);
    }
  );
});

gulp.task('default', gulp.series('build'));
