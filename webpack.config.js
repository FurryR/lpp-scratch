const svgToMiniDataURI = require('mini-svg-data-uri');
const webpack = require('webpack');
const path = require('path');
const packageJSON = require('./package.json');
const process = require('node:process');

const base = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/index.ts',
    output: {
        // eslint-disable-next-line no-undef
        path: path.resolve(__dirname, 'dist'),
        publicPath: './',
        filename: 'lpp.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: ['ts-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif)$/,
                type: 'asset/inline'
            },
            {
                test: /\.svg$/,
                type: 'asset/inline',
                generator: {
                    dataUrl: (content) => svgToMiniDataURI(content.toString())
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            __LPP_VERSION__: JSON.stringify(packageJSON.version)
        })
    ]
};

module.exports = base;