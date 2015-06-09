# Azure Cross-Platform Storage Explorer
[![Build Status](https://travis-ci.org/azure-storage/xplat.svg)](https://travis-ci.org/azure-storage/xplat) [![Code Climate](https://codeclimate.com/github/azure-storage/xplat/badges/gpa.svg)](https://codeclimate.com/github/azure-storage/xplat)

A cross-platform implementation of azure storage explorer allowing the manipulation of azure [blob storage](http://azure.microsoft.com/en-us/documentation/articles/storage-introduction/) accounts and eventually tables and queues.

## Development
#### Prerequisites

You will need the following things properly installed on your computer.
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

#### Running / Development
To run a small dev server with autoreload, simply execute `ember nw`. Since we're running Node and UI JavaScript on the same thread, running `ember serve` alone won't suffice.

#### Running Tests
All tests suites can be run with `npm test`. Functional and unit tests can be run with `ember test` and `ember test --server`. Code Style tests with JSHint and JSCS can be run with `grunt test`.

#### Building the App
Building packaged apps is automated via Grunt. From any Unix machine, run `grunt compile`, which will first build the latest version of the Ember app followed by packaging it for OS X, Linux, Windows, and a transfer of the changed ffmpeg binaries.

Please note that in order to create a Windows build with the correct icon, you need to run `grunt prebuild && grunt compileWindowsWithIcon` from either a Windows machine or a Unix machine with Wine installed.