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
    
    $('#features').click(function () {
        var features = $('#featuresList'),
            opener = $('#featuresOpener');

        if (features.is(':hidden')) {
            features.slideDown();
            opener.slideUp();
        } else {
            features.slideUp();
            opener.slideDown();
        }
    });

    $('#issues').click(function () {
        var issues = $('#issuesList'),
            opener = $('#issuesOpener');

        if (issues.is(':hidden')) {
            issues.slideDown();
            opener.slideUp();
        } else {
            issues.slideUp();
            opener.slideDown();
        }
    });
   
   $('#fixes').click(function () {
        var fixes = $('#fixesList'),
            opener = $('#fixesOpener');

        if (fixes.is(':hidden')) {
            fixes.slideDown();
            opener.slideUp();
        } else {
            fixes.slideUp();
            opener.slideDown();
        }
    }); 
    
};

init();