const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = [
  {
    mode: "development",
    entry: "./src/main.ts",
    target: "electron-main",
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: "ts-loader" }],
        },
      ],
    },
    output: {
      path: __dirname + "/dist",
      filename: "main.js",
    },
  },
  {
    mode: "development",
    entry: "./src/onboarding/OnboardingFlow.tsx",
    target: "electron-renderer",
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          include: /src/,
          use: [{ loader: "ts-loader" }],
        },
        {
          test: /\.css$/,
          include: /src/,
          use: [{ loader: "style-loader" }, { loader: "css-loader" }],
        },
      ],
    },
    output: {
      path: __dirname + "/dist",
      filename: "OnboardingFlow.js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "OnboardingFlow.html",
      }),
    ],
  },
];
