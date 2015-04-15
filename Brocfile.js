/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var app = new EmberApp();
var path = require('path');
var fs = require('fs');
// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
// nwjs requires a package.json in order to runu anything

// these in-line vars are only used by test runs
var app;

// brocfile-env module hasn't been decided on how to expose more build options

app = new EmberApp({
  inlineContent: {
    'qunit-logger': './tests/helpers/qunit-logger.js',
    'test-base': {
        content: '<base href=\"../\"/>'
    }
  }
});

var tree = new Funnel('tests', {
    files: ['package.json'],
    destDir: 'tests'
});

// Identify the platform and place the correct ffmpeg binary into the nwjs package
// This provides nwjs with the codecs to play normal mp4 & mp3 media for the
// blob preview feature. Not ideal but building much more of a pain
var binary;
var dir;
var destPath;

if (process.platform === 'darwin') {
    dir = 'bin/darwin/64/';
    binary = 'ffmpegsumo.so';
    destPath = 'node_modules/nw/nwjs/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Libraries';
} else if (process.platform === 'linux') {
    binary = 'linux/64/libffmpegsumo.so';
} else if (process.platform === 'win32') {
    binary = 'windows/32/ffmpegsumo.dll';
}

var binTree;

if (dir && binary && destPath) {
    if (fs.existsSync(path.join(destPath, binary))) {
        fs.unlinkSync(path.join(destPath, binary));
    }
    binTree = new Funnel(dir, {
        files: [binary],
        destDir: path.join('../../', destPath)
    });
}

if (binTree) {
    module.exports = mergeTrees([app.toTree(), tree, binTree]);
} else {
    module.exports = mergeTrees([app.toTree(), tree]);
}
