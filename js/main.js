var store = {
    os: null,
    downloadLink: null,
    downloadLinks: {
        macosx: 'https://github.com/azure-storage/xplat/releases/download/v0.4.0/azure-storage-explorer_osx_040.dmg',
        windows: 'https://github.com/azure-storage/xplat/releases/download/v0.4.0/azure-storage-explorer_win_040.msi',
        linux: 'https://github.com/azure-storage/xplat/releases/download/v0.4.0/azure-storage-explorer_linux_040.zip',
        windowsStandalone: 'https://github.com/azure-storage/xplat/releases/download/v0.4.0/azure-storage-explorer_win_standalone_040.zip'
    }
};

function getOS() {
    if (navigator.platform.indexOf('Win') > -1) {
        store.os = 'Windows';
    }

    if (navigator.platform.indexOf('Mac') > -1) {
        store.os = 'Mac OS X';
    }

    if (navigator.platform.indexOf('Linux') > -1 || navigator.platform.indexOf('X11') > -1) {
        store.os = 'Linux';
    }
}

function setupDownloadButton() {
    var button = $('#mainDownload'),
        downloadLinkl

    getOS();

    if (store.os) {
        downloadLink = store.downloadLinks[store.os.toLowerCase().replace(/ /g,'')]
        button.text('Download for ' + store.os);
        button.attr('href', downloadLink);
    } else {
        button.text('Download');
    }
    
}

setupDownloadButton();