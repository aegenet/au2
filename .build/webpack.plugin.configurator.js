/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');

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

module.exports = function() {
  return function (env, { analyze }) {
    const production = env.production || process.env.NODE_ENV === 'production';
    return {
      target: production ? 'node' : 'web',
      mode: production ? 'production' : 'development',
      devtool: production ? undefined : 'eval-cheap-source-map',
      entry: {
        // Build only plugin in production mode,
        // build dev-app in non-production mode
        entry: production ? './src/index.ts' : './dev-app/main.ts',
      },
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: production ? 'index.js' : '[name].bundle.js',
        library: production ? { type: 'commonjs' } : undefined,
      },
      resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'dev-app'), 'node_modules'],
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
        !production && new HtmlWebpackPlugin({ template: 'index.html' }),
        new Dotenv({
          path: `./.env${production ? '' : '.' + (process.env.NODE_ENV || 'development')}`,
        }),
        analyze && new BundleAnalyzerPlugin(),
      ].filter(p => p),
    };
  };
};
