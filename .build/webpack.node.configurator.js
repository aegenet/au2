const path = require('path');
const fs = require('fs');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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
  const indexPath = path.join(options.directory, './src/index.ts');
  const cliPath = path.join(options.directory, './src/cli.ts');
  const entry = { [options.name]: indexPath };
  if (fs.existsSync(cliPath)) {
    entry[options.name + '-cli'] = cliPath;
  }

  return function (env, { analyze }) {
    const production = env.production || process.env.NODE_ENV === 'production';
    return {
      target: options.target ?? 'node16',
      mode: production ? 'production' : 'development',
      devtool: production ? undefined : 'eval-cheap-source-map',
      entry,
      node: {
        __dirname: false,
        __filename: false,
      },
      // experiments: {
      //   outputModule: true,
      // },  
      output: {
        path: path.join(options.directory, 'dist/', options.subdir ?? ''),
        filename: `[name].bundle.js`,
        library: {
          name: options.name,
          type: options.libraryType ?? 'commonjs',
        },
      },
      externalsPresets: { node: true },
      externals: options.externals,
      plugins: [
        ... options.plugins ?? [],
        new Dotenv({
          path: `./.env${production ? '' : '.' + (process.env.NODE_ENV || 'development')}`,
        }),
        analyze && new BundleAnalyzerPlugin(),
      ].filter(f => f),
      resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.resolve(options.directory, 'src'), path.join(options.directory, 'node_modules')],
        alias: {
          [options.name]: path.join(options.directory, 'src'),
          [`@${options.org}/${options.name}`]: path.join(options.directory, 'src/'),
        },
      },
      devServer: {
        historyApiFallback: true,
        open: !process.env.CI,
        port: 9322,
      },
      module: {
        rules: [
          { test: /\.ts$/i, use: ['ts-loader'], exclude: /node_modules/ },
        ]
      }
    };
  };
};
