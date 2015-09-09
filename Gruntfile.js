module.exports = function (grunt) {
    // Load all grunt tasks matching the `grunt-*` pattern,
    // unless we're on Linux or Windows
    if (process.platform && process.platform === 'darwin') {
        require('load-grunt-tasks')(grunt);
    } else {
        require('load-grunt-tasks')(grunt, {scope: ['devDependencies', 'dependencies']});
    }

    // Get Version
    function getVersion () {
        var githash = require('githash');
        var version = process.env.RELEASE_VERSION ? process.env.RELEASE_VERSION : githash();
    }

    var files = ['app/**/*.js', 'Brocfile.js'];
    // Tagged builds get their own folders. live builds just go to live folder
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
                    path: './builds/Azure Storage Explorer-darwin-x64/Azure Storage Explorer.app'
                }]
            },
            target: {
                dest: './builds/Azure Storage Explorer-darwin-x64/azureexplorer.dmg'
            }
        },
        copy: {
            app: {
                expand: true,
                src: ['electron.js', 'package.json', 'dist/**', 'node_modules/azure-storage/**', 'node_modules/fs-extra/**', 'node_modules/memorystream/**'],
                dest: 'electronbuildcache/'
            },
            version_file: {
                src: ['./.version'],
                dest: 'electronbuildcache/version'
            }
        },
        'create-windows-installer': {
            ia32: {
                appDirectory: './builds/Azure Storage Explorer-win32-ia32',
                outputDirectory: './builds/installer32',
                exe: 'Azure Storage Explorer.exe',
                iconUrl: './public/icon/ase.ico',
                setupIcon: './public/icon/ase.ico'
            }
        },
        jshint: {
            files: files,
            options: {
                jshintrc: './.jshintrc'
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
        electron: {
            osx: {
                options: {
                    name: 'Azure Storage Explorer',
                    platform: 'darwin',
                    arch: 'x64',
                    dir: 'electronbuildcache',
                    out: 'builds',
                    version: '0.32.1',
                    overwrite: true,
                    icon: 'public/icon/ase.icns',
                    'app-version': getVersion(),
                    'build-version': getVersion()
                }
            },
            windows: {
                options: {
                    name: 'Azure Storage Explorer',
                    platform: 'win32',
                    arch: 'all',
                    dir: 'electronbuildcache',
                    out: 'builds',
                    version: '0.32.1',
                    overwrite: true,
                }
            },
            windowsWithIcon: {
                options: {
                    name: 'Azure Storage Explorer',
                    platform: 'win32',
                    arch: 'ia32',
                    dir: 'electronbuildcache',
                    out: 'builds',
                    version: '0.32.1',
                    overwrite: true,
                    icon: 'public/icon/ase.ico'
                }
            },
            linux: {
                options: {
                    name: 'Azure Storage Explorer',
                    platform: 'linux',
                    arch: 'ia32',
                    dir: 'electronbuildcache',
                    out: 'builds',
                    version: '0.32.1',
                    overwrite: true
                }
            },
        },
        exec: {
            build: {
                command: 'ember build --environment=production'
            }
        },
        zip: {
            linux: {
                cwd: './builds/azureexplorer/linux64',
                src: ['./builds/azureexplorer/linux64/**/*'],
                dest: './builds/azureexplorer/linux64/build.zip'
            },
            osx: {
                cwd: './builds/Azure Storage Explorer-darwin-x64/',
                src: ['./builds/Azure Storage Explorer-darwin-x64/**/*'],
                dest: './builds/Azure Storage Explorer-darwin-x64/build.zip'
            },
            windows: {
                cwd: './builds/azureexplorer/win32',
                src: ['./builds/azureexplorer/win32/**/*'],
                dest: './builds/azureexplorer/win32/build.zip'
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
                    './build.zip'
                ],
                cwd: './builds/Azure Storage Explorer-linux-ia32/'
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
                    './build.zip'
                ],
                cwd: './builds/Azure Storage Explorer-darwin-x64/'
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
                    './build.zip'
                ],
                cwd: './builds/Azure Storage Explorer-win32-ia32/'
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
        clean: ['./electronbuildcache', './dist', './builds'],
    });

    grunt.registerTask('codestyle', ['jshint', 'jscs']);
    grunt.registerTask('test', ['codestyle']);
    grunt.registerTask('default', ['test']);
    grunt.registerTask('copyForBuild', ['copy:app', 'copy:version_file']);
    grunt.registerTask('prebuild', ['clean', 'exec:build', 'file-creator:version_file', 'copyForBuild']);
    grunt.registerTask('compileOSX', ['electron:osx', 'appdmg']);
    grunt.registerTask('compileLinux', ['electron:linux']);
    grunt.registerTask('compileWindows', ['electron:windows']);
    grunt.registerTask('compileWindowsWithIcon', ['electron:windowsWithIcon']);
    grunt.registerTask('compile', ['prebuild', 'compileOSX', 'compileWindows', 'compileLinux']);

    // Development Builds
    // To deploy a build with an official build number, set env var RELEASE_VERSION to release number
    // otherwise application is tagged with git hash
    grunt.registerTask('compileDevBuild', ['prebuild', 'electron:osx', 'electron:windows', 'electron:linux']);
    grunt.registerTask('createDevBuild', ['compileDevBuild', 'zip', 'if:trusted-deploy-to-azure-cdn']);
};