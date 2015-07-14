# Azure Cross-Platform Storage Explorer
[![Build Status](https://travis-ci.org/azure-storage/xplat.svg)](https://travis-ci.org/azure-storage/xplat) [![Code Climate](https://codeclimate.com/github/azure-storage/xplat/badges/gpa.svg)](https://codeclimate.com/github/azure-storage/xplat)

A file explorer for your [Azure Blob Storage](http://azure.microsoft.com/en-us/documentation/articles/storage-introduction/) accounts, enabling you to easily work with your assets and containers from Mac OS X, Windows, and Linux. Create and delete containers, upload, download, and delete whole folders and files, preview media assets - with the free Azure Storage Explorer, you're in full control of your assets. Check out [storageexplorer.com](http://storageexplorer.com) for more infos and downloads.

![Screenshot](https://raw.githubusercontent.com/azure-storage/xplat/764e4e379101a7f8b39633b25580a203929471cd/imgs/screenshot.png)

## Development
#### Prerequisites

You will need the following things properly installed on your computer.
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

#### Running / Development
The explorer is written using Ember Cli, ES2015 and Node. The environemt is somewhat unique in that we're running Node and Chromium's JavaScript on the same thread, allowing us to consume the official Azure Storage Node API from within Ember/Chromium.

To run a small development environment with autoreload, simply execute `ember nw`. Since we're running Node and UI JavaScript on the same thread, running `ember serve` alone won't suffice.

#### Running Tests
All tests suites can be run with `npm test`. 

Functional and unit tests can be run with `ember nw:test`. You can also do `ember nw:test --server` to run tests continuously. Code Style tests with JSHint and JSCS can be run with `grunt test`.

#### Building the App
Building packaged apps is automated via Grunt. From any Unix machine, run `grunt compile`, which will first build the latest version of the Ember app followed by packaging it for OS X, Linux, Windows, and a transfer of the changed ffmpeg binaries.

Please note that in order to create a Windows build with the correct icon, you need to run `grunt prebuild && grunt compileWindowsWithIcon` from either a Windows machine or a Unix machine with Wine installed.

##### Distribution
The image for Mac OS X is automatically packaged as a 'pretty DMG' with the LICENSE attached. However, hidden files aren't moved outside of DMG's view - to make the package really pretty, open the output in `./webkitbuilds/azureexplorer/osx64` and reposition the hidden files before distributing.

## License
The Azure Cross-Platform Explorer is licensed as GPLv3, since we're using GPL-licensed components to display and play media formats. We would have loved to license this code with a more permissive license, but could not - please make sure to consult `LICENSE` and [the GPL information website](http://www.gnu.org/licenses/quick-guide-gplv3.en.html) for details about the license.