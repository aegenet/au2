module.exports = function() {
  return {
    testEnvironment: './../../.build/client/setup-node.js',
    setupFilesAfterEnv: [
      "./../../.build/client/setup-after-env.js"
    ],
    transform: {
      "\\.(css|less|sass|scss|styl|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
        "./../../node_modules/jest-transform-stub",
      "\\.(ts|html)$": [
        "./../../node_modules/@aurelia/ts-jest",
        {
          defaultShadowOptions: {
            mode: "open",
          },
        },
      ],
    },
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
    coverageReporters: ["lcov", "text-summary", "html"],
    globals: {
      "ts-jest": {
        isolatedModules: true,
      },
    },
  };
};
