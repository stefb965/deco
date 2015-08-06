/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
      // Add options here
    });

    var path = require('path');
    var fs = require('fs');
    var Funnel = require('broccoli-funnel');

    var binary, dir, destPath, binTree;

    if (process.platform === 'darwin') {
        dir = 'bin/darwin/64/';
        binary = 'ffmpegsumo.so';
        destPath = 'node_modules/nw/nwjs/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Libraries';
    } else if (process.platform === 'linux') {
        binary = 'linux/64/libffmpegsumo.so';
    } else if (process.platform === 'win32') {
        binary = 'windows/32/ffmpegsumo.dll';
    }

    if (dir && binary && destPath) {
        if (fs.existsSync(path.join(destPath, binary))) {
            fs.unlinkSync(path.join(destPath, binary));
        }
        binTree = new Funnel(dir, {
            files: [binary],
            destDir: path.join('../../', destPath)
        });
    }

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

    return app.toTree();
};
