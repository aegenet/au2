const path = require('path');

/**
 * 
 * @param {
 *   directory?: string;
 *   reporter?: Array<'lcov' | 'text-summary' | 'html' | 'json'>;
 * } options 
 * @returns NYC Configuration
 * 
 */
module.exports = function(
  options
) {
  const coveragePath = path.join(options.directory ?? path.join(__dirname, '..'), 'coverage');
  const tempPath = path.join(options.directory ?? path.join(__dirname, '..'), '.nyc_output');

  return {
    "include": [
      "build/**/*.js",
      "src/**/*.ts"
    ],
    "exclude": [
      "build/**/*.spec.js",
      "src/**/*.spec.ts"
    ],
    "extension": [
      ".ts"
    ],
    "reporter": options.reporter ?? [
      "json", "text-summary"
    ],
    "report-dir": coveragePath,
    "temp-dir": tempPath,
    "sourceMap": true,
    "instrument": true
  };
}
