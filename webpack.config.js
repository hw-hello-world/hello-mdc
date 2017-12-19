'use strict';

const os = require('os');
const path = require('path');
const fsx = require('fs-extra');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const glob = require('glob');

const OUT_DIR_ABS = path.resolve('./dist');
const DEMO_ASSET_DIR_REL = '/';
const OUT_DEMO_ABS = `${OUT_DIR_ABS}/demos`;

const IS_DEV = process.env.MDC_ENV === 'development';
const IS_PROD = process.env.MDC_ENV === 'production';

const WRAP_CSS_IN_JS = false;
const GENERATE_SOURCE_MAPS = false;
const DEVTOOL = GENERATE_SOURCE_MAPS ? 'source-map' : false;
const BUILD_STATIC_DEMO_ASSETS = true;

const CSS_JS_FILENAME_OUTPUT_PATTERN = `[name]${IS_PROD ? '.min' : ''}.css${IS_DEV ? '.js' : '.js-entry'}`;
const CSS_FILENAME_OUTPUT_PATTERN = `[name]${IS_PROD ? '.min' : ''}.css`;

const CSS_LOADER_CONFIG = [
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
      ident: 'postcss',
      plugins: () => [
        require('autoprefixer')({grid: false}),
      ],
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


const createCssLoaderConfig = () =>
        WRAP_CSS_IN_JS ?
        [{loader: 'style-loader'}].concat(CSS_LOADER_CONFIG) :
      ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: CSS_LOADER_CONFIG,
      });

const createCssExtractTextPlugin = () => new ExtractTextPlugin(CSS_FILENAME_OUTPUT_PATTERN);


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
    if (!fsx.existsSync(OUT_DIR_ABS)) {
      return;
    }

    const demosDirAbs = path.resolve('./node_modules/material-components-web/dist/');
    const tmpDirAbs = path.resolve('./demos/mdc-web/');

    const copyOptions = {
    };

    fsx.copySync(demosDirAbs, tmpDirAbs, copyOptions);

  });
};

module.exports = [];

module.exports.push(
  {
    name: 'css',
    entry: {
      'hw-button': path.resolve('./packages/button/hw-button.scss'),
      'hw-font': path.resolve('./packages/font/hw-font.scss'),
      'hw-theme': path.resolve('./packages/theme/hw-theme.scss'),
    },
    output: {
      path: OUT_DIR_ABS,
      publicPath: DEMO_ASSET_DIR_REL,
      filename: '[name].css',
    },
    devtool: DEVTOOL,
    module: {
      rules: [{
        test: /\.scss$/,
        use: createCssLoaderConfig(),
      }],
    },
    plugins: [
      createCssExtractTextPlugin(),

      new CopyWebpackPlugin([{
        from: './packages/font/font/*',
        to: `${OUT_DIR_ABS}/font`,
        flatten: true,
      }]),
      //new WriteFilePlugin(),
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
      path: OUT_DEMO_ABS,
      publicPath: DEMO_ASSET_DIR_REL,
      filename: '[name].css',
    },
    devtool: DEVTOOL,
    module: {
      rules: [{
        test: /\.scss$/,
        use: createCssLoaderConfig(),
      }],
    },
    plugins: [
      createCssExtractTextPlugin(),

      createStaticDemoPlugin(),
    ],
  }
);
