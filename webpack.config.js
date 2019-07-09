const path = require('path')

// Configurations shared between all builds 
const common = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'rdf-easy.bundle.js',
        library: 'RDFeasy',
        libraryExport: 'default',
    },
    externals: {
        'solid-auth-cli': 'null',
        'rdflib': {
            commonjs: 'rdflib',
            commonjs2: 'rdflib',
            amd: 'rdflib',
            root: '$rdf'
        },
    },
    devtool: 'source-map',
}

// Configurations specific to the browser build
const browser = {
    ...common,
    name: 'browser',
    output: {
        ...common.output,
        path: path.resolve(__dirname, 'dist', 'browser'),
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
}

// Configurations specific to the node build
const node = {
    ...common,
    name: 'node',
    output: {
        ...common.output,
        path: path.resolve(__dirname, 'dist', 'node'),
        libraryTarget: 'commonjs2',
    },
}


module.exports = [browser,node]



