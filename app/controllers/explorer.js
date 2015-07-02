import Ember from 'ember';
import config from '../config/environment';
export default Ember.Controller.extend({
    // Services & Aliases
    // ------------------------------------------------------------------------------
    needs: 'application',
    activeConnection: Ember.computed.alias('controllers.application.activeConnection'),
    azureStorage: Ember.computed.alias('nodeServices.azureStorage'),
    fileSvc: Ember.computed.alias('nodeServices.fs'),
    nodeServices: Ember.inject.service(),

    // Properties
    // ------------------------------------------------------------------------------
    activeContainer: null,
    blobs: [],
    subDirectories: [],
    pathSegments: [{ name: '/' }],      // individal directory names of current path
    allBlobSelected: false,
    newContainerEntryDisplay: false,
    modalFileUploadPath: '',            // path used for the local file path for upload
    modalDefaultUploadPath: '',         // path used for the upload path to azure in the upload modal
    searchSpinnerDisplay: false,
    newContainerName: '',
    searchQuery: '',
    blobsLoading: true,
    selectedBlob: null,

    // Init & Setup
    // ------------------------------------------------------------------------------
    init: function () {
        if (config.environment !== 'test') {
            Ember.run.scheduleOnce('afterRender', this, () => {
                var self = this;
                Ember.$('.files')[0].ondrop = e => {
                    self.send('handleFileDragDrop', e);
                };
            });
        }
    },

    // Computed Properties
    // ------------------------------------------------------------------------------
    containers: function () {
        var self = this;

        if (!this.get('searchQuery')) {
            return this.get('model');
        } else {
            this.set('searchSpinnerDisplay', true);
            var promise = this.store.find('container', {name: this.get('searchQuery')});
            promise.then(() => self.set('searchSpinnerDisplay', false));
            return promise;
        }
    }.property('searchQuery'),

    currentPath: function () {
        var path = '';
        var first = true;
        this.get('pathSegments').forEach(segment => {
            if (first) {
                // the first slash should be skipped
                first = false;
                return;
            }

            path += segment.name;
        });

        return path;
    }.property('pathSegments'),

    // Observers
    // ------------------------------------------------------------------------------
    activeContainerObserver: function () {
        var activeContainer = this.get('activeContainer'),
            blobs = [],
            self = this,
            containerObject;

        if (!this.get('containers') || !this.get('containers').get('firstObject')) {
            // if there are no containers bail out (in case of empty search)
            return;
        }

        // clear out subdirs'
        this.set('blobsLoading', true);
        this.set('subDirectories', []);

        if (!activeContainer) {
            containerObject = self.get('containers').get('firstObject');
            containerObject.set('blobPrefixFilter', self.get('currentPath'));
            if (containerObject) {
                blobs = containerObject.get('blobs');

                self.set('blobs', blobs);
                self.set('blobsLoading', false);
                Ember.run.next(() => {
                    self.set('activeContainer', containerObject.id);
                });

                containerObject.listDirectoriesWithPrefix(this.get('currentPath'))
                .then(result => {
                    var subDirs = [];
                    result.forEach(dir => {
                        subDirs.push({
                            name: dir.name
                        });
                    });
                    self.set('subDirectories', subDirs);
                });
            }
        } else {
            return this.store.find('container', activeContainer).then(function (result) {
                if (result) {
                    result.set('blobPrefixFilter', self.get('currentPath'));
                    blobs = result.get('blobs');
                } else {
                    blobs = [];
                }

                result.listDirectoriesWithPrefix(self.get('currentPath'))
                .then(result => {
                    var subDirs = [];
                    result.forEach(dir => {
                        subDirs.push({
                            name: dir.name
                        });
                    });
                    self.set('subDirectories', subDirs);
                });

                self.set('blobs', blobs);
                self.set('blobsLoading', false);
            });
        }
    }.observes('containers', 'activeContainer', 'model'),

    pathSegmentObserver : function () {
        this.set('subDirectories', []);
    }.observes('pathSegments'),

    // Actions
    // ------------------------------------------------------------------------------
    actions: {

        handleFileDragDrop: function (e) {
            var sourcePaths = '',
                self = this,
                activeContainer = this.get('activeContainer'),
                file;
            // dataTransfer.files doesn't have forEach
            for (var i in e.dataTransfer.files) {
                if (i % 1 === 0) {
                    file = e.dataTransfer.files[i];
                    if (i < e.dataTransfer.files.length - 1) {
                        sourcePaths += file.path + ';';
                    } else {
                        sourcePaths += file.path;
                    }
                }
            }

            Ember.$('#modal-upload').openModal();

            // https://github.com/Dogfalo/materialize/issues/1532
            // ugh!
            var overlay = Ember.$('#lean-overlay');
            overlay.detach();
            Ember.$('.explorer-container').after(overlay);

            self.set('modalFileUploadPath', sourcePaths);

            self.store.find('container', activeContainer).then(result => {
                self.set('modalDefaultUploadPath', result.get('name') + ':/' + self.get('currentPath'));
            });
        },

        switchActiveContainer: function (selectedContainer) {
            // reset all blobs selected flag
            if (selectedContainer === this.get('activeContainer')) {
                return;
            }
            this.set('pathSegments', [{ name: '/' }]);
            this.set('allBlobSelected', false);
            this.set('activeContainer', selectedContainer);
        },

        uploadBlobData: function (filePaths, azurePath) {
            var self = this,
                activeContainer = this.get('activeContainer'),
                containerPath = azurePath.replace(/.*\:\//, ''),
                paths = filePaths.split(';'),
                fileName;

            self.store.find('container', activeContainer).then(foundContainer => {
                var promises = [];
                paths.forEach(path => {
                    fileName = path.replace(/^.*[\\\/]/, '');
                    promises.push(foundContainer.uploadBlob(path, containerPath + fileName));
                });
                return Ember.RSVP.all(promises);
            })
            .then(() => {
                self.send('refreshBlobs');
            })
            .catch (error => {
                toast(error, 4000);
            });
        },

        changeDirectory: function (directory) {
            // we have recieved a path segment object, ie: the user clicked a path button
            var pathSegs = [];

            this.get('pathSegments').every(segment => {
                pathSegs.push(segment);
                return (segment !== directory);
            });
            this.set('subDirectories', []);
            this.set('pathSegments', pathSegs);
            this.send('refreshBlobs');
        },

        changeSubDirectory: function (directory) {
            var pathSegs = [ { name: '/' } ];

            // we have recieved a literal path
            directory.name.split('/').forEach(segment => {
                if (segment === '') {
                    return;
                }

                pathSegs.push({ name: segment + '/' });
            });

            this.set('pathSegments', pathSegs);
            this.send('refreshBlobs');
        },

        uploadBlob: function () {
            var nwInput = Ember.$('#nwUploadFile'),
                activeContainer = this.get('activeContainer'),
                self = this;

            nwInput.change(function () {
                nwInput.off('change');
                Ember.$('#modal-upload').openModal();

                // https://github.com/Dogfalo/materialize/issues/1532
                // ugh!
                var overlay = Ember.$('#lean-overlay');
                overlay.detach();
                Ember.$('.explorer-container').after(overlay);

                self.set('modalFileUploadPath', this.value);

                self.store.find('container', activeContainer).then(result => {
                    self.set('modalDefaultUploadPath', result.get('name') + ':/' + self.get('currentPath'));
                });

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
            var nwInput = Ember.$('#nwSaveInput'),
                blobs = this.get('blobs'),
                handleInputDirectory;

            nwInput.attr('nwsaveas', 'directory');

            handleInputDirectory = function (dir) {
                blobs.forEach(function (blob) {
                    // check if this one is marked for download
                    if (blob.get('selected')){
                        var fileName = blob.get('name').replace(/^.*[\\\/]/, '');
                        var targetPath = dir + '/' + fileName;
                        blob.toFile(targetPath);
                    }
                });
            };

            // check that at least one blob is selected
            var noBlobsSelected = blobs.every(blob => {
                return (!blob.get('selected'));
            });

            // if no blobs are selected we don't need to show the native dialog
            if (!noBlobsSelected) {
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

        deleteBlobs: function () {
            var blobs = this.get('blobs'),
                deleteCount = 0;

            blobs.forEach(function (blob) {
                if (blob.get('selected')) {
                    deleteCount += 1;
                }
            });

            if (deleteCount === 0) {
                return;
            }

            // Setup values expected by delete modal
            this.set('modalConfirmAction', 'deleteBlobData');
            this.set('modalDeleteCount', deleteCount);
            this.set('modalDeleteType', 'blob');

            // Open delete prompt
            Ember.$('#modal-delete').openModal();

            // https://github.com/Dogfalo/materialize/issues/1532
            // ugh!
            var overlay = Ember.$('#lean-overlay');
            overlay.detach();
            Ember.$('.explorer-container').after(overlay);
        },

        deleteBlobData: function () {
            var blobs = this.get('blobs'),
                self = this;

            blobs.forEach(function (blob) {
                // check if this one is marked for deleting
                if (blob.get('selected')){
                    blob.deleteRecord();
                    blob.save();
                    if (blob === self.get('selectedBlob')) {
                        self.set('selectBlob', null);
                    }
                }
            });

            this.set('blobs', blobs);
        },

        refreshBlobs: function () {
            var blobs = [],
                self = this;

            this.store.find('container', this.get('activeContainer'))
            .then(result => {
                if (result) {
                    result.set('blobPrefixFilter', self.get('currentPath'));
                    blobs = result.get('blobs');
                } else {
                    blobs = [];
                }

                self.set('blobs', blobs);
                self.set('blobsLoading', false);
                return result;
            })
            .then(container => {
                return container.listDirectoriesWithPrefix(self.get('currentPath'));
            })
            .then(result => {
                var subDirs = [];
                result.forEach(dir => {
                    subDirs.push({
                        name: dir.name
                    });
                });
                self.set('subDirectories', subDirs);
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
    }
});
