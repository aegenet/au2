/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');
const { BundleDeclarationsWebpackPlugin } = require('bundle-declarations-webpack-plugin');

const cssLoader = 'css-loader';

const sassLoader = {
  loader: 'sass-loader',
  options: {
    sassOptions: {
      includePaths: ['node_modules'],
    },
  },
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: ['autoprefixer'],
    },
  },
};

/**
 * 
 * @param {
 *   org: string;
 *   name: string;
 *   directory: string;
 *   subdir?: string;
 *   target?: 'node' | 'web' | string;
 *   libraryType?: string;
 *   externals?: unknown[];
 *   plugins?: unknown[];
 * } options 
 * @returns Webpack Configuration
 * 
 */
module.exports = function(
  options
) {
  options = options ?? {};
  const directory = options.directory ?? process.cwd();
  const indexPath = path.join(directory, './src/index.ts');
  return function (env, { analyze }) {
    const production = env.production || process.env.NODE_ENV === 'production';
    return {
      target: options.target ? options.target : 'web', // production ? 'node' : 'web',
      mode: production ? 'production' : 'development',
      devtool: production ? undefined : 'eval-cheap-source-map',
      entry: {
        // Build only plugin in production mode,
        // build dev-app in non-production mode
        entry: production ? indexPath : './dev-app/main.ts',
      },
      experiments: {
        outputModule: true,
      },
      output: {
        path: path.resolve(directory, 'dist',  options.subdir ?? ''),
        filename: production ? 'index.mjs' : '[name].bundle.mjs',
        library: production ? { type: 'module' } : undefined,
      },
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          [options.name]: path.join(directory, 'src'),
          [`@${options.org}/${options.name}`]: path.join(directory, 'src/'),
        },
        modules: [path.resolve(directory, 'src'), path.resolve(directory, 'dev-app'), path.join(directory, 'node_modules'), 'node_modules'],
      },
      devServer: {
        historyApiFallback: true,
        open: !process.env.CI,
        port: 9321,
      },
      module: {
        rules: [
          { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset' },
          { test: /\.(woff|woff2|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, type: 'asset' },
          {
            test: /\.css$/i,
            exclude: [/(?<![/\\]src[/\\]code-mirror)\.scss$/, /node_modules/],
            // For style loaded in src/main.js, it's not loaded by style-loader.
            // It's for shared styles for shadow-dom only.
            issuer: /[/\\]src[/\\]main\.(js|ts)$/,
            use: [cssLoader, postcssLoader],
          },
          // {
          //   test: /\.scss$/i,
          //   exclude: [/(?<![/\\]src[/\\]code-mirror)\.scss$/, /node_modules/],
          //   // For style loaded in src/main.js, it's not loaded by style-loader.
          //   // It's for shared styles for shadow-dom only.
          //   issuer: /[/\\]src[/\\]main\.(js|ts)$/,
          //   use: [cssLoader, postcssLoader, sassLoader],
          // },
          {
            test: /\.scss$/i,
            exclude: /node_modules/,
            use: ['sass-to-string', sassLoader],
          },
          {
            test: /\.css$/i,
            exclude: [/(?<![/\\]src[/\\]code-mirror)\.scss$/, /node_modules/],
            // For style loaded in other js/ts files, it's loaded by style-loader.
            // They are directly injected to HTML head.
            issuer: /(?<![/\\]src[/\\]main)\.(js|ts)$/,
            use: ['style-loader', cssLoader, postcssLoader],
          },
          // {
          //   test: /\.scss$/i,
          //   exclude: [/(?<![/\\]src[/\\]code-mirror)\.scss$/, /node_modules/],
          //   // For style loaded in other js/ts files, it's loaded by style-loader.
          //   // They are directly injected to HTML head.
          //   issuer: /(?<![/\\]src[/\\]main)\.(js|ts)$/,
          //   use: ['style-loader', cssLoader, postcssLoader, sassLoader],
          // },
          {
            test: /\.css$/i,
            exclude: [/(?<![/\\]src[/\\]code-mirror)\.scss$/, /node_modules/],
            // For style loaded in html files, Aurelia will handle it.
            issuer: /\.html$/,
            use: [cssLoader, postcssLoader],
          },
          // {
          //   test: /\.scss$/i,
          //   exclude: [/(?<![/\\]src[/\\]code-mirror)\.scss$/, /node_modules/],
          //   // For style loaded in html files, Aurelia will handle it.
          //   issuer: /\.html$/,
          //   use: [cssLoader, postcssLoader, sassLoader],
          // },
          { test: /\.ts$/i, use: ['ts-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
          {
            test: /[/\\](?:src|dev-app)[/\\].+\.html$/i,
            use: {
              loader: '@aurelia/webpack-loader',
              options: {
                // The other possible Shadow DOM mode is 'closed'.
                // If you turn on "closed" mode, there will be difficulty to perform e2e
                // tests (such as Cypress). Because shadowRoot is not accessible through
                // standard DOM APIs in "closed" mode.
                defaultShadowOptions: { mode: 'open' },
              },
            },
            exclude: /node_modules/,
          },
        ],
      },
      externalsPresets: { node: production },
      externals: [
        // Skip npm dependencies in plugin build.
        production && nodeExternals(),
      ].filter(p => p),
      plugins: [
        ... options.plugins ?? [],
        !production && new HtmlWebpackPlugin({ template: 'index.html' }),
        new Dotenv({
          path: `./.env${production ? '' : '.' + (process.env.NODE_ENV || 'development')}`,
        }),
        analyze && new BundleAnalyzerPlugin(),
      ].filter(p => p),
    };
  };
};
