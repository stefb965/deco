var BrowserWindow = require('browser-window');
var app = require('app');
var mainWindow = null;

app.on('window-all-closed', function onWindowAllClosed() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function onReady() {
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
        mainWindow.openDevTools();
        //mainWindow.loadUrl('http://localhost:5000');
    } else {
        mainWindow.loadUrl('file://' + __dirname + '/dist/index.html');
    }

    mainWindow.on('closed', function onClosed() {
        mainWindow = null;
    });
});