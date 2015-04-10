import Ember from 'ember';
export default Ember.Controller.extend({
    needs: 'application',

    activeConnection: Ember.computed.alias('controllers.application.activeConnection'),

    activeContainer: null,

    blobs: [],

    blobsLoading: true,

    selectedBlob: null,

    activeContainerObserver: function () {
        var activeContainer = this.get('activeContainer'),
            blobs = [],
            self = this,
            containerObject;

        this.set('blobsLoading', true);

        if (!activeContainer) {
            containerObject = this.get('model').get('firstObject');
            blobs = containerObject.get('blobs');

            this.set('blobs', blobs);
            this.set('blobsLoading', false);
        } else {
            return this.store.find('container', activeContainer).then(function (result) {
                if (result) {
                    blobs = result.get('blobs');
                } else {
                    blobs = [];
                }

                self.set('blobs', blobs);
                self.set('blobsLoading', false);
            });
        }
    }.observes('model', 'activeContainer'),

    actions: {
        switchActiveContainer: function (selectedContainer) {
            this.set('activeContainer', selectedContainer);
        },

        downloadBlob: function (blob, name) {
            var nwInput = Ember.$('#nwSaveInput');

            nwInput.attr('nwsaveas', name);

            nwInput.change(function () {
                blob.toFile(this.value);
                nwInput.off('change');
            });

            nwInput.click();
        },

        selectBlob: function(blob) {
            this.set('selectedBlob', blob);
        }
    }
});
