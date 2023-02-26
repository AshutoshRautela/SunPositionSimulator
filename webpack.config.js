const path = require('path');

const webpackConfig = {
    mode: 'development',
    entry: './index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: path.resolve(__dirname, "node_modules")
            }
        ]
    },
    devServer: {
        static: './dist'
    }
};

module.exports = webpackConfig;