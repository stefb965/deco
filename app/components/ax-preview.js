import Ember from 'ember';

/**
 * A preview component, previewing a video/image for a blob record
 * @param  {Blob Record} selectedBlob       - The blob that should be previewed
 * @param  {string} previewLink             - The blob that should be previewed
 * @param  {boolean} typeImage              - Is the blob an image file?
 * @param  {boolean} typeAudio              - Is the blob an audio file?
 * @param  {boolean} typeVideo              - Is the blob an video file?
 */
export default Ember.Component.extend({
    selectedBlob: null,
    previewLink: null,
    typeImage: false,
    typeAudio: false,
    typeVideo: false,

    /**
     * Observes the selected blob and updates the individual types.
     * Computed properties would be better, but we also need to reset the
     * materialbox.
     */
    targetTypeObserver: function () {
        var selectedBlob = this.get('selectedBlob');
        var type;

        if (!selectedBlob) {
            return;
        }

        if (selectedBlob) {
            type = selectedBlob.get('type');

            this.set('typeImage', false);
            this.set('typeAudio', false);
            this.set('typeVideo', false);

            if (type.indexOf('image') > -1) {
                this.set('typeImage', true);
                appInsights.trackEvent('PreviewImage');
            } else if (type.indexOf('audio') > -1) {
                this.set('typeAudio', true);
                appInsights.trackEvent('PreviewAudio');
            } else if (type.indexOf('video') > -1) {
                this.set('typeVideo', true);
                appInsights.trackEvent('PreviewVideo');
            }

            this.set('type', type);
        }

        selectedBlob.getLink().then(result => this.set('previewLink', result.url));
        Ember.run.scheduleOnce('afterRender', this, function () {
            Ember.$('.materialboxed').materialbox();
        });
    }.observes('selectedBlob'),

    /**
     * Works around a Chrome issue, reloading multimedia tags.
     */
    previewLinkObserver: function () {
        Ember.run.scheduleOnce('afterRender', this, () => {
            if (this.get('typeAudio') || this.get('typeVideo')) {
                let mediaElement = Ember.$('#previewMedia');
                if (mediaElement && mediaElement[0]) {
                    mediaElement[0].load();
                }
            }
        });
    }.observes('previewLink')
});
