/**
 * Liquid Fire Transitions
 */
var transition = function () {
    this.transition(
        this.fromRoute('welcome'),
        this.toRoute('explorer'),
        this.use('toLeft'),
        this.reverse('toRight')
    );

    this.transition(
        this.hasClass('blobsLoading'),
        this.toValue(true),
        this.use('crossFade'),
        this.reverse('crossFade')
    );
};

export default transition;