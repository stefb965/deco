module.exports = function (grunt) {
    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    var files = ['app/**/*.js', 'Brocfile.js'];
    // tagged builds get their own folders. live builds just go to live folder
    var cdnPath = process.env.RELEASE_VERSION ? process.env.RELEASE_VERSION : 'live';

    grunt.initConfig({
        appdmg: {
            options: {
                title: 'Azure Storage Exporer',
                icon: './public/icon/ase.icns',
                background: './postcompile/osx/background.tiff',
                'icon-size': 156,
                contents: [{
                    x: 470,
                    y: 430,
                    type: 'link',
                    path: '/Applications'
                }, {
                    x: 120,
                    y: 430,
                    type: 'file',
                    path: './webkitbuilds/azureexplorer/osx64/azureexplorer.app'
                }]
            },
            target: {
                dest: './webkitbuilds/azureexplorer/osx64/azureexplorer.dmg'
            }
        },
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
        // Warning: If trying to compile Windows with Icon 
        // on OS X / Linux, you'll need Wine.
        nodewebkit: {
            osx: {
                options: {
                    platforms: ['osx64'],
                    buildDir: './webkitbuilds',
                    macIcns: './public/icon/ase.icns',
                },
                src: ['./nwbuildcache/**/*']
            },
            linux: {
                options: {
                    platforms: ['linux64'],
                    buildDir: './webkitbuilds'
                },
                src: ['./nwbuildcache/**/*']
            },
            windows: {
                options: {
                    platforms: ['win32'],
                    buildDir: './webkitbuilds'
                },
                src: ['./nwbuildcache/**/*']
            },
            windowsWithIcon: {
                options: {
                    platforms: ['win32'],
                    buildDir: './webkitbuilds',
                    winIco: './public/icon/ase.ico'
                },
                src: ['./nwbuildcache/**/*']
            }
        },
        exec: {
            build: {
                command: 'ember build --environment=production'
            },
            dmgLicense: {
                command: 'python ./postcompile/osx/licenseDMG.py ./webkitbuilds/azureexplorer/osx64/azureexplorer.dmg ./LICENSE'
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
                dest: 'nwbuildcache/'
            },
            version_file: {
                src: ['./.version'],
                dest: 'nwbuildcache/version'
            },
            memorystream: {
                expand: true,
                src: ['node_modules/memorystream/**'],
                dest: 'nwbuildcache/'
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
            },
            bin_windows: {
                src: './bin/windows/32/ffmpegsumo.dll',
                dest: './webkitbuilds/azureexplorer/win32/ffmpegsumo.dll'
            }
        },
        zip: {
            linux: {
                cwd: './webkitbuilds/azureexplorer/linux64',
                src: ['./webkitbuilds/azureexplorer/linux64/**/*'],
                dest: './webkitbuilds/azureexplorer/linux64/build.zip'
            },
            osx: {
                cwd: './webkitbuilds/azureexplorer/osx64',
                src: ['./webkitbuilds/azureexplorer/osx64/**/*'],
                dest: './webkitbuilds/azureexplorer/osx64/build.zip'
            },
            windows: {
                cwd: './webkitbuilds/azureexplorer/win32',
                src: ['./webkitbuilds/azureexplorer/win32/**/*'],
                dest: './webkitbuilds/azureexplorer/win32/build.zip'
            }
        },
        'if': {
            'trusted-deploy-to-azure-cdn': {
                options: {
                    test: function () {
                        // these variables will only be valid and set during trusted builds
                        var trustedBuild = (typeof process.env.AZURE_STORAGE_ACCOUNT === 'string' && typeof process.env.AZURE_STORAGE_ACCESS_KEY === 'string');
                        return trustedBuild;
                    }
                },
                ifTrue: ['azure-cdn-deploy'],
                ifFalse: []
            }
        },
        // deploys live build to cdn
        'azure-cdn-deploy': {
            linux: {
                options: {
                    containerName: 'builds', // container name in blob
                    folder: cdnPath, // path within container
                    zip: false, // gzip files if they become smaller after zipping, content-encoding header will change if file is zipped
                    deleteExistingBlobs: false, // true means recursively deleting anything under folder
                    concurrentUploadThreads: 10, // number of concurrent uploads, choose best for your network condition
                    metadata: {
                        cacheControl: 'public, max-age=31530000', // cache in browser
                        cacheControlHeader: 'public, max-age=31530000' // cache in azure CDN. As this data does not change, we set it to 1 year
                    },
                    testRun: false // test run - means no blobs will be actually deleted or uploaded, see log messages for details
                },
                src: [
                    './linux64/build.zip'
                ],
                cwd: './webkitbuilds/azureexplorer/'
            },
            osx: {
                options: {
                    containerName: 'builds', // container name in blob
                    folder: cdnPath, // path within container
                    zip: false, // gzip files if they become smaller after zipping, content-encoding header will change if file is zipped
                    deleteExistingBlobs: false, // true means recursively deleting anything under folder
                    concurrentUploadThreads: 10, // number of concurrent uploads, choose best for your network condition
                    metadata: {
                        cacheControl: 'public, max-age=31530000', // cache in browser
                        cacheControlHeader: 'public, max-age=31530000' // cache in azure CDN. As this data does not change, we set it to 1 year
                    },
                    testRun: false // test run - means no blobs will be actually deleted or uploaded, see log messages for details
                },
                src: [
                    './osx64/build.zip'
                ],
                cwd: './webkitbuilds/azureexplorer'
            },
            windows: {
                options: {
                    containerName: 'builds', // container name in blob
                    folder: cdnPath, // path within container
                    zip: false, // gzip files if they become smaller after zipping, content-encoding header will change if file is zipped
                    deleteExistingBlobs: false, // true means recursively deleting anything under folder
                    concurrentUploadThreads: 10, // number of concurrent uploads, choose best for your network condition
                    metadata: {
                        cacheControl: 'public, max-age=31530000', // cache in browser
                        cacheControlHeader: 'public, max-age=31530000' // cache in azure CDN. As this data does not change, we set it to 1 year
                    },
                    testRun: false // test run - means no blobs will be actually deleted or uploaded, see log messages for details
                },
                src: [
                    './win32/build.zip'
                ],
                cwd: './webkitbuilds/azureexplorer'
            }
        },
        'file-creator': {
            version_file: {
                '.version': function (fs, fd, done) {
                    var githash = require('githash');
                    var version = process.env.RELEASE_VERSION ? process.env.RELEASE_VERSION : githash();
                    fs.writeSync(fd, version);
                    done();
                }
            }
        },
        clean: ['./nwbuildcache', './dist', './webkitbuilds'],
    });

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-js-beautify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-azure-cdn-deploy');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-file-creator');
    grunt.loadNpmTasks('grunt-appdmg');

    grunt.registerTask('codestyle', ['jshint', 'jscs']);
    grunt.registerTask('test', ['codestyle']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('beautify', ['js_beautify']);
    grunt.registerTask('copyForBuild', ['copy:nwbuildcache', 'copy:azure_storage', 'copy:memorystream', 'copy:pack', 'copy:version_file']);
    grunt.registerTask('prebuild', ['clean', 'exec', 'file-creator:version_file', 'copyForBuild']);
    grunt.registerTask('compileOSX', ['nodewebkit:osx', 'copy:bin_osx', 'appdmg', 'exec:dmgLicense']);
    grunt.registerTask('compileLinux', ['nodewebkit:linux', 'copy:bin_linux']);
    grunt.registerTask('compileWindows', ['nodewebkit:windows', 'copy:bin_windows']);
    grunt.registerTask('compileWindowsWithIcon', ['nodewebkit:windowsWithIcon', 'copy:bin_windows']);
    grunt.registerTask('compile', ['prebuild', 'compileOSX', 'compileWindows', 'compileLinux']);
    // to deploy a build with an official build number, set env var RELEASE_VERSION to release number
    // otherwise application is tagged with git hash
    grunt.registerTask('deployBuild', ['compile', 'zip', 'if:trusted-deploy-to-azure-cdn']);
};