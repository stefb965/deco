function getOS() {
    var os = '';
    
    if(navigator.platform.indexOf('Linux') > -1 || navigator.platform.indexOf('X11') > -1) {
        os = 'linux';
    } else if(navigator.platform.indexOf('Mac') > -1) {
        os = 'osx';
    } else if(navigator.platform.indexOf('Win') > -1) {
        os = 'windows';
    }
    
    return os;
}

function init() {
    var os = getOS();
    
    switch(os) {
        case 'linux':
            $('#linuxDownloadBtn').show();
            $('#osxDownloadLink').show();
            $('#windowsDownloadLink').show();
            break;
        case 'osx':
            $('#osxDownloadBtn').show();
            $('#linuxDownloadLink').show();
            $('#windowsDownloadLink').show();
            break;
        case 'windows':
            $('#windowsDownloadBtn').show();
            $('#linuxDownloadLink').show();
            $('#osxDownloadLink').show();
            break;
        default: 
            $('#linuxDownloadBtn').show();
            $('#osxDownloadBtn').show();
            $('#windowsDownloadBtn').show();                                  
    }
};

init();