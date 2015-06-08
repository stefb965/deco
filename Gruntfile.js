module.exports = function (grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    var files = ['app/**/*.js', 'Brocfile.js'];

    grunt.initConfig({
        jshint: {
            files: files,
            options: {
                jshintrc: './.jshintrc'
            }
        },
        js_beautify: {
            default_options: {
                options: {
                    end_with_newline: true,
                    max_preserve_newlines: 1
                },
                files: {
                    'application_files': ['app/**/*.js']
                }
            }
        },
        jscs: {
            files: {
                src: files
            },
            options: {
                config: '.jscsrc',
                esnext: true
            }
        },
        // Execute individual builds with the commands below
        // Warning: If trying to compile Windows on OS X / Linux,
        // you'll need Wine.
        // 
        // grunt compile --platforms:'win'
        // grunt compile --platforms:'osx'
        // grunt compile --platforms:'linux'
        nodewebkit: {
            options: {
                platforms: ['win', 'osx', 'linux'],
                buildDir: './webkitbuilds',
                macIcns: './public/icon/ase.icns',
                winIco: './public/icon/ase.ico'
            },
            src: ['./dist/'] // Your node-webkit app
        }
    });

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-js-beautify');

    grunt.registerTask('codestyle', ['jshint', 'jscs']);
    grunt.registerTask('test', ['codestyle']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('beautify', ['js_beautify']);
    grunt.registerTask('compile', ['ember build --production', 'nodewebkit ']);
};