// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.


module.exports = {

    context: 'C:\\Users\\James\\Dropbox\\sdmx-orb',
    output: {
        path: 'C:\\Users\\James\\Dropbox\\sdmx-orb\\public_html\\js',
        filename: 'sdmx-orb.js'
    },
    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css','.scss'],
        alias: {"react": "preact-compat",
            "react-dom": "preact-compat",
            "react-dnd": "preact-dnd"
        }

    },
    // Source maps support ('inline-source-map' also works)
    devtool: 'source-map',
    entry: ['./src/main'],
    // Add the loader for .ts files.
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader'
            },
            {
                test: /\.css$/,
                loader: 'css-loader',
                query: {
                    modules: true,
                    localIdentName: '[name]__[local]___[hash:base64:5]'
                }
            }]
    }
};