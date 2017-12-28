'use strict';

const os = require('os');
const path = require('path');
const fsx = require('fs-extra');
const webpack = require('webpack');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const OUT_DIR_ABS = path.resolve('./dist');
// public path for dev server. doesn't expect other prefix cause the font importing url starts from root.
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
      includePaths: [path.resolve('./node_modules')],
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

const cssEntries = glob.sync('packages/*/hw-*.scss')
        .reduce((init, filename) => {
          const xs = filename.split('/');
          const key = xs[xs.length - 1].slice(0, -5);
          const filepath = path.resolve(`./${filename}`);

          return Object.assign(init, {[key]: filepath});
        }, {});

module.exports.push({
  name: 'css',
  entry: cssEntries,
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

    new CopyWebpackPlugin([{
      from: './packages/icon/icon/*',
      to: `${OUT_DIR_ABS}/icon`,
      flatten: true,
    }]),
  ],
});

const jsEntries = glob.sync('packages/*/index.js')
        .reduce((init, filename) => {
          const xs = filename.split('/');
          const key = xs[xs.length - 2];
          const filepath = path.resolve(`./${filename}`);

          return Object.assign(init, {[key]: filepath});
        }, {});

module.exports.push({
  name: 'js-components',
  entry: jsEntries,
  output: {
    path: OUT_DIR_ABS,
    publicPath: DEMO_ASSET_DIR_REL,
    filename: 'hw-[name].' + (IS_PROD ? 'min.' : '') + 'js',
    libraryTarget: 'umd',
    library: ['mdc', '[name]'],
  },
  devtool: DEVTOOL,
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    }],
  },
  plugins: [

  ],
});

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
