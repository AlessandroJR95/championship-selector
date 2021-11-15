const path = require('path');
const nodeExternals = require('webpack-node-externals')

module.exports = {
    entry: './src/main.ts',
    target: 'node',
    mode: 'development',
    externals: [nodeExternals()],
    devtool: 'source-map',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'server'),
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
            src: path.resolve(__dirname, 'src/')
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    }
};