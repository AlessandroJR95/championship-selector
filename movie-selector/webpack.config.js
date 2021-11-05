const path = require('path');
const nodeExternals = require('webpack-node-externals')

module.exports = {
    entry: './src/main.js',
    target: 'node',
    mode: 'development',
    externals: [nodeExternals()],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'server'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
        ]
    }
};