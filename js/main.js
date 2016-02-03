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
            $('#linuxDownload').show();
            break;
        case 'osx':
            $('#osxDownload').show();
            break;
        case 'windows':
            $('#windowsDonwload').show();
            break;
        default: 
            $('#linuxDownload').show();
            $('#osxDownload').show();
            $('#windowsDonwload').show();                                  
    }
};

init();