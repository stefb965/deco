import Ember from 'ember';

export default Ember.Controller.extend({
    needs: 'application',

    activeConnection: Ember.computed.alias('controllers.application.activeConnection'),

    activeContainer: null,

    blobs: [],

    allBlobSelected: false,

    nodeServices: Ember.inject.service(),

    newContainerEntryDisplay: false,

    searchSpinnerDisplay: false,

    newContainerName: '',

    searchQuery: '',

    blobsLoading: true,

    selectedBlob: null,

    model: function () {
        var self = this;
        if (!this.get('searchQuery')) {
            return this.store.find('container');
        } else {
            this.set('searchSpinnerDisplay', true);
            var promise = this.store.find('container', {name: this.get('searchQuery')});
            promise.then(() => self.set('searchSpinnerDisplay', false));
            return promise;
        }
    }.property('searchQuery'),

    activeContainerObserver: function () {
        var activeContainer = this.get('activeContainer'),
            blobs = [],
            self = this,
            containerObject;

        if (!this.get('model').get('firstObject')) {
            // if there are no containers bail out (in case of empty search)
            return;
        }

        this.set('blobsLoading', true);

        if (!activeContainer) {
            containerObject = this.get('model').get('firstObject');
            if (containerObject) {
                blobs = containerObject.get('blobs');

                this.set('blobs', blobs);
                this.set('blobsLoading', false);
                Ember.run.next(() => {
                    this.set('activeContainer', containerObject.id);
                });
            }

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
            // reset all blobs selected flag
            this.set('allBlobSelected', false);
            this.set('activeContainer', selectedContainer);
        },

        uploadBlob: function () {
            var nwInput = Ember.$('#nwUploadFile'),
                activeContainer = this.get('activeContainer'),
                self = this;

            nwInput.change(function () {
                self.store.find('container', activeContainer).then(foundContainer => {
                    foundContainer.uploadBlob(this.value).then(function () {
                        self.send('refreshBlobs');
                    }, function (error) {
                        toast(error, 4000);
                    });
                });
                nwInput.off('change');
            });

            nwInput.click();
        },
        selectAllBlobs: function () {
            var self = this;
            this.get('blobs').forEach(blob => {
                if (!self.get('allBlobSelected')) {
                    blob.set('selected', true);
                } else {
                    blob.set('selected', false);
                }
            });

            this.toggleProperty('allBlobSelected');
        },
        // directory parameter is a test hook for automation
        downloadBlobs: function (directory) {
            var nwInput = Ember.$('#nwSaveInput');
            var blobs = this.get('blobs');
            nwInput.attr('nwsaveas', 'directory');

            var handleInputDirectory = function (dir) {

                blobs.forEach(function (blob) {
                    // check if this one is marked for download
                    if (blob.get('selected')){
                        var targetPath = dir + '/' + blob.get('name');
                        blob.toFile(targetPath);
                    }
                });
            };

            // check that at least one blob is selected
            var atLeastOne = false;

            blobs.every(function (blob) {
                if (blob.get('selected')){
                    atLeastOne = true;
                    // break iteration
                    return false;
                }

                return true;
            });

            // if no blobs are selected we don't need to show the native dialog
            if (atLeastOne) {
                // native dialog won't work in automation so skip in automation
                if (!directory) {
                    nwInput.change(function () {

                        handleInputDirectory(this.value);
                        // reset value to ensure change event always fires
                        this.value = '';
                        nwInput.off('change');
                    });

                    nwInput.click();
                } else {
                    handleInputDirectory(directory);
                }
            }
        },

        selectBlob: function (blob) {
            this.set('selectedBlob', blob);
        },

        refreshBlobs: function () {
            var blobs = [],
                self = this;

            this.store.find('container', this.get('activeContainer')).then(function (result) {
                if (result) {
                    blobs = result.get('blobs');
                } else {
                    blobs = [];
                }

                self.set('blobs', blobs);
                self.set('blobsLoading', false);
            });
        },

        showNewContainer: function () {
            return this.set('newContainerEntryDisplay', true);
        },

        createContainer: function () {

            var newContainer = this.store.createRecord('container', { name: this.get('newContainerName'), id: this.get('newContainerName') });
            var self = this;
            return newContainer.save().then(function (){
                return self.set('newContainerEntryDisplay', false);
            });
        }
    },
    azureStorage: Ember.computed.alias('nodeServices.azureStorage'),
    fileSvc: Ember.computed.alias('nodeServices.fs')
});
