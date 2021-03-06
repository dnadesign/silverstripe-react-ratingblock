const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const eslintFormatter = require('react-dev-utils/eslintFormatter');

module.exports = merge(common, {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: 'http://localhost:8080/dist/'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(scss|sass)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader',
                    'fast-sass-loader'
                ]
            },
            {
                test: /\.(js|jsx)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            formatter: eslintFormatter,
                            eslintPath: require.resolve('eslint')
                        },
                        loader: require.resolve('eslint-loader')
                    }
                ],
                include: path.join(__dirname, 'src')
            }
        ]
    },
    devServer: {
        hot: true,
        open: true,
        port: 8082,
        publicPath: 'http://localhost:8080/dist',
        disableHostCheck: true,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods':
                'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers':
                'X-Requested-With, content-type, Authorization'
        }
    }
});
