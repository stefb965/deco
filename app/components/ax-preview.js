import Ember from 'ember';

export default Ember.Component.extend({
    selectedBlob: null,
    previewLink: null,
    typeImage: false,
    typeAudio: false,
    typeVideo: false,

    targetTypeObserver: function () {
        var selectedBlob = this.get('selectedBlob');
        var type;

        if (selectedBlob) {
            type = selectedBlob.get('type');

            this.set('typeImage', false);
            this.set('typeAudio', false);
            this.set('typeVideo', false);

            if (type.indexOf('image') > -1) {
                this.set('typeImage', true);
            } else if (type.indexOf('audio') > -1) {
                this.set('typeAudio', true);
            } else if (type.indexOf('video') > -1) {
                this.set('typeVideo', true);
            }
        }

        selectedBlob.getLink().then(result => this.set('previewLink', result));
        Ember.run.scheduleOnce('afterRender', this, function () {
            Ember.$('.materialboxed').materialbox();
        });
    }.observes('selectedBlob')

});
