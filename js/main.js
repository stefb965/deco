function isLinux() {
    return (navigator.platform.indexOf('Linux') > -1 || navigator.platform.indexOf('X11') > -1);
}

function init() {
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