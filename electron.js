var BrowserWindow = require('browser-window');
var app = require('app');
var path = require('path');
var cp = require('child_process');
var mainWindow = null;

var handleSquirrelEvent = function () {
    if (process.platform != 'win32') {
        return false;
    }

    function executeSquirrelCommand(args, done) {
        var updateDotExe = path.resolve(path.dirname(process.execPath),
            '..', 'update.exe');
        var child = cp.spawn(updateDotExe, args, {
            detached: true
        });
        child.on('close', function (code) {
            done();
        });
    };

    function install(done) {
        var target = path.basename(process.execPath);
        executeSquirrelCommand(["--createShortcut", target], done);
    };

    function uninstall(done) {
        var target = path.basename(process.execPath);
        executeSquirrelCommand(["--removeShortcut", target], done);
    };

    var squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
    case '--squirrel-install':
        install(app.quit);
        return true;
    case '--squirrel-updated':
        install(app.quit);
        return true;
    case '--squirrel-obsolete':
        app.quit();
        return true;
    case '--squirrel-uninstall':
        uninstall(app.quit);
        return true;
    }

    return false;
};

var checkForGitHubRelease = function () {
    var gh_releases = require('electron-gh-releases');

    var options = {
        repo: 'azure-storage/deco',
        currentVersion: app.getVersion()
    }

    var update = new gh_releases(options, function (auto_updater) {
        auto_updater.on('update-downloaded', function (e, rNotes, rName, rDate, uUrl, quitAndUpdate) {
            var dialog = require('dialog');
            dialog.showMessageBox({
                type: 'info',
                buttons: ['Hooray!'],
                title: 'Update Downloaded',
                message: 'We found and downdloaded a new version of the Azure Storage Explorer! Once you close this dialog, Azure Storage Explorer will automatically update and restart.'
            });

            // Install the update
            quitAndUpdate();
        });
    });

    // Check for updates
    update.check(function (err, status) {
        if (!err && status) {
            update.download();
        }
    });
};

app.on('window-all-closed', function onWindowAllClosed() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function onReady() {
    if (handleSquirrelEvent()) {
        return;
    }

    // Check for update
    checkForGitHubRelease();

    mainWindow = new BrowserWindow({
        title: 'Azure Storage Explorer',
        width: 1100,
        height: 750,
        min_width: 800,
        min_height: 600,
    });

    delete mainWindow.module;

    if (process.platform !== 'darwin' && process.platform.indexOf('win') === -1) {
        mainWindow.icon = __dirname + '/icon/ase.png';
    }

    if (process.env.ELECTRON_ENV === 'development') {
        // Dev Tools are included, but if you're in deep trouble,
        // use the line below to programmtically open them:
        // mainWindow.openDevTools();
        mainWindow.loadUrl('http://localhost:5000');
    } else {
        mainWindow.loadUrl('file://' + __dirname + '/dist/index.html');
    }

    mainWindow.on('closed', function onClosed() {
        mainWindow = null;
    });
});