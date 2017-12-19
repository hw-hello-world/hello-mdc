'use strict';

const os = require('os');
const path = require('path');
const fsx = require('fs-extra');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const glob = require('glob');

const OUT_DIR_ABS = path.resolve('./dist');
//const DEMO_ASSET_DIR_REL = '/assets/'; // Used by webpack-dev-server and MDC_BUILD_STATIC_DEMO_ASSETS

const IS_DEV = process.env.MDC_ENV === 'development';
const IS_PROD = process.env.MDC_ENV === 'production';

const GENERATE_SOURCE_MAPS = true;
const DEVTOOL = GENERATE_SOURCE_MAPS ? 'source-map' : false;
const BUILD_STATIC_DEMO_ASSETS = true;

const CSS_LOADER_CONFIG = [
  {
    loader: 'style-loader'
  },
  {
    loader: 'css-loader',
    options: {
      sourceMap: GENERATE_SOURCE_MAPS,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: GENERATE_SOURCE_MAPS,
      plugins: () => [require('autoprefixer')({grid: false})],
    },
  },
  {
    loader: 'sass-loader',
    options: {
      sourceMap: GENERATE_SOURCE_MAPS,
      includePaths: glob.sync('packages/*/node_modules').map((d) => path.join(__dirname, d)),
    },
  },
];


class PostCompilePlugin {
  constructor(fn) {
    this.fn = fn;
  }

  apply(compiler) {
    compiler.plugin('done', (stats) => this.fn(stats));
  }
}

const createStaticDemoPlugin = () => {
  return new PostCompilePlugin(() => {
    if (!BUILD_STATIC_DEMO_ASSETS || !fsx.existsSync(OUT_DIR_ABS)) {
      return;
    }

    const demosDirAbs = path.resolve('./demos');
    const tmpDirAbs = fsx.mkdtempSync(path.join(os.tmpdir(), 'mdc-web-demo-output-'));

    const copyOptions = {
      filter: (src) => {
        return !/\.(scss|css.js)$/.test(src);
      },
    };

    fsx.copySync(demosDirAbs, tmpDirAbs, copyOptions);
    fsx.copySync(OUT_DIR_ABS, path.join(tmpDirAbs, DEMO_ASSET_DIR_REL), copyOptions);

    // The `npm run build` command emits JS/CSS files directly to the $REPO/build/ directory (for distribution via npm).
    // The `npm run build:demo` command, however, outputs _all_ static demo files (including HTML and images).
    // Because the demo site expects JS/CSS files to be in /assets/, we need to reorganize the output folders to combine
    // $REPO/demos/ and $REPO/build/ such that the demo site's import paths don't need to change.
    fsx.removeSync(OUT_DIR_ABS);
    fsx.moveSync(tmpDirAbs, OUT_DIR_ABS);
  });
};

module.exports = [];

module.exports.push(
  {
    name: 'css',
    entry: {
      'hw.button': path.resolve('./packages/button/hw-button.scss'),
    },
    output: {
      path: OUT_DIR_ABS,
      //publicPath: DEMO_ASSET_DIR_REL,
      filename: '[name].css',
    },
    devtool: DEVTOOL,
    module: {
      rules: [{
        test: /\.scss$/,
        use: CSS_LOADER_CONFIG,
      }],
    },
    plugins: [
    ],
  }
);

const demoStyleEntry = {};
glob.sync('demos/**/*.scss').forEach((filename) => {
  demoStyleEntry[filename.slice(6, -5)] = path.resolve(filename);
});
module.exports.push(
  {
    name: 'demo-css',
    entry: demoStyleEntry,
    output: {
      path: `${OUT_DIR_ABS}/demos` ,
      //publicPath: DEMO_ASSET_DIR_REL,
      filename: '[name].css.js',
    },
    devtool: DEVTOOL,
    module: {
      rules: [{
        test: /\.scss$/,
        use: CSS_LOADER_CONFIG,
      }],
    },
    plugins: [
      new CopyWebpackPlugin([{
        from: 'demos/*.html',
        to: `${OUT_DIR_ABS}`,
      }])
    ],
  }
);
