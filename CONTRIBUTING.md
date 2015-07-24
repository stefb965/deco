# Contributing Guide for the Azure Storage Explorer
Hey there! Thanks for checking out the Azure Storage Explorer. It's currently a small project developed with the hope that it will help developers working with Azure Blob Storage - especially those using Mac OS X or Linux, where great "file explorer" solutions are not readily available.

As such, it is not an "official Microsoft product", but rather a small side project. If you're interested in helping out, we very much welcome you! This guide will give you a quick intro into the codebase.

## TL;DR
If you're raising a bug please be sure to include as much info as possible so that we can fix it! If you've got some code you want to pull request please squash commits, use [this commit message format](https://github.com/TryGhost/Ghost/wiki/Git-workflow#commit-messages) and check it passes the tests by running `npm test`. Thanks for helping us make the Azure Storage Explorer better. Please also make sure to [sign our CLA](https://cla.microsoft.com/) - we have a friendly CLA bot that will help you once you make a PR.

**Please: Always create an issue before submitting a Pull Request**. It'll ensure that none of us are doing any unnecessary work! 

## Submitting Pull Requests
Pull requests are awesome. If you're looking to raise a PR for something which doesn't have an open issue, please think carefully about raising an issue which your PR can close, especially if you're fixing a bug. This makes it more likely that there will be enough information available for your PR to be properly tested and merged. To make sure your PR is accepted as quickly as possible, please take a minute to check the guidelines on:

###### Commit Messages
Follow this format:
```
Add Contributing Guide 

Closes #156
- Added CONTRIBUTING.md
- Also added a few welcome words to the readme
```

###### Cleaning-up History
Please make sure to [squash commits](https://robots.thoughtbot.com/git-interactive-rebase-squash-amend-rewriting-history) and rebase if appropriate.

###### Not Breaking the Build
Please run `npm test` locally before submitting a PR. We cannot accept any Pull Request that fails tests. If you're having trouble with it (no worries, we all have it all the time), make a PR and we can help you out.

If you're not completely clear on how to submit / update / do Pull Requests, [send us a mail and we'll get you sorted out](mailto:feriese@microsoft.com;sedouard@microsoft.com)!

## Internals
The explorer is written entirely in JavaScript (ES2015). It uses the popular MVC framework Ember.js to render the application. Communication and interaction with the Azure Storage API is driven by the official Azure Storage Node SDK, which is directly consumed by Ember via an Ember Data Adapter. 

You might be wondering how we're using Node in a web-based app: The Azure Storage Explorer is compiled down to a NW.js application, which allows running Chromium's frontend JavaScript and Node.js code on the same thread.

* `app/` - The core application, compiled with Babel and Ember Cli
* `bin/` - ffmpeg binaries for media playback, added to the build during compilation
* `config/` - Ember Cli environment configuration variables
* `postcompile/` - Various supporting files and scripts for installer creation
* `public/` - Files available in the app namespace (like fonts, images, etc.)
* `tests`/ - All our tests!

### Getting Ready For Development
You'll need recent versions of Node, Grunt, Bower, Git, and Ember Cli. To install Ember Cli, [follow the official installation guide](http://www.ember-cli.com/user-guide/#getting-started).

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [Grunt CLI](http://npmjs.com/grunt-cli)

Once setup, you can run a live-reloading version of the app with `ember nw`. Once you change a source file, Ember Cli will automatically recompile and reload your app. Since we're running Node and UI JavaScript on the same thread, running `ember serve` alone won't suffice.

To get access to the Chromium Developer Tools, simply make a right click and select 'DevTools' - we're also pulling down the Ember Inspector, which can also be launched with a right click.

##### Windows
On Windows, getting all the dependencies to work can sometimes be a bit tricky. If things fail, try to run these commands before running `npm install`:

```
npm install --no-optional --no-bin-links Automattic/engine.io-client
npm install --no-optional --no-bin-links socket.io
npm install --no-optional --no-bin-links testem
npm install --global --no-optional --no-bin-links ember-cli
```

### Running Tests
All tests suites can be run with `npm test`. 

Functional and unit tests can be run with `ember nw:test`. You can also do `ember nw:test --server` to run tests continuously. Code Style tests with JSHint and JSCS can be run with `grunt test`.

### Building the App
Building packaged apps is automated via Grunt. From any Unix machine, run `grunt compile`, which will first build the latest version of the Ember app followed by packaging it for OS X, Linux, Windows, and a transfer of the changed ffmpeg binaries.

Please note that in order to create a Windows build with the correct icon, you need to run `grunt prebuild && grunt compileWindowsWithIcon` from either a Windows machine or a Unix machine with Wine installed.

### Distribution
The image for Mac OS X is automatically packaged as a 'pretty DMG' with the LICENSE attached. However, hidden files aren't moved outside of DMG's view - to make the package really pretty, open the output in `./webkitbuilds/azureexplorer/osx64` and reposition the hidden files before distributing.