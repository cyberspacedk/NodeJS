require('ignore-styles')

// To support ES6 modules
require('@babel/register')({
    ignore: [/(node_module)/],
    presets: ['@babel/preset-env', '@babel/preset-react']
})

require('./server')