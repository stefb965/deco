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
        // grunt compile --platforms'win
        // grunt compile --platforms:osx
        // grunt compile --platforms:linux
        nodewebkit: {
            osx: {
                options: {
                    platforms: ['osx64'],
                    buildDir: './webkitbuilds',
                    macIcns: './public/icon/ase.icns',
                },
                src: ['./nwbuildcache/**/*'] // Your node-webkit app
            },
            linux: {
                options: {
                    platforms: ['linux64'],
                    buildDir: './webkitbuilds'
                },
                src: ['./nwbuildcache/**/*'] // Your node-webkit app
            },
            windows: {
                options: {
                    platforms: ['win32'],
                    buildDir: './webkitbuilds',
                    winIco: './public/icon/ase.ico'
                },
                src: ['./nwbuildcache/**/*'] // Your node-webkit app
            }
        },
        exec: {
            build: {
                command: 'ember build --production'
            }
        },
        copy: {
            nwbuildcache: {
                expand: true,
                src: ['dist/**'],
                dest: 'nwbuildcache/'
            },
            azure_storage: {
                expand: true,
                src: ['node_modules/azure-storage/**'],
                dest: 'nwbuildcache/node_modules/azure-storage/'
            },
            memorystream: {
                expand: true,
                src: ['node_modules/memorystream/**'],
                dest: 'nwbuildcache/node_modules/memorystream/'
            },
            pack: {
                src: './package.json',
                dest: './nwbuildcache/package.json'
            },
            bin_osx: {
                src: './bin/darwin/64/ffmpegsumo.so',
                dest: './webkitbuilds/azureexplorer/osx64/azureexplorer.app/Contents/Frameworks/nwjs Framework.framework/Libraries/ffmpegsumo.so'
            },
            bin_linux: {
                src: './bin/linux/64/libffmpegsumo.so',
                dest: './webkitbuilds/azureexplorer/linux64/libffmpegsumo.so'
            }
        },
        clean: ['./nwbuildcache', './dist', './webkitbuilds']
    });

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-js-beautify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('codestyle', ['jshint', 'jscs']);
    grunt.registerTask('test', ['codestyle']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('beautify', ['js_beautify']);
    grunt.registerTask('copyForBuild', ['copy:nwbuildcache', 'copy:azure_storage', 'copy:memorystream', 'copy:pack']);
    grunt.registerTask('prebuild', ['clean', 'exec', 'copyForBuild']);
    grunt.registerTask('compileOSX', ['prebuild', 'nodewebkit:osx', 'copy:bin_osx']);
    grunt.registerTask('compileLinux', ['prebuild', 'nodewebkit:linux', 'copy:bin_linux]);
};