import Ember from 'ember';
import Notification from '../models/notification';
import config from '../config/environment';
import stringResources from '../utils/string-resources';
/**
 * The controller for the file explorer - in many ways the main controller for the application,
 * controlling container/blob selection and interaction.
 */
export default Ember.Controller.extend({
    // Services & Aliases
    // ------------------------------------------------------------------------------
    needs: ['application', 'notifications'],
    activeConnection: Ember.computed.alias('controllers.application.activeConnection'),
    notifications: Ember.computed.alias('controllers.notifications'),
    azureStorage: Ember.computed.alias('nodeServices.azureStorage'),
    fileSvc: Ember.computed.alias('nodeServices.fs'),
    nodeServices: Ember.inject.service(),

    // Properties
    // ------------------------------------------------------------------------------
    activeContainer: null,              // DS.Record of the currently selected container
    blobs: [],                          // Ember.MutableArray containing the blobs for the current container
    subDirectories: [],                 // Ember.MutableArray containing the directories for the current container
    pathSegments: [{name: '/'}],        // Individal directory names of current path
    allBlobSelected: false,             // Are all blobs selected?
    newContainerEntryDisplay: false,
    modalFileUploadPath: '',            // Path used for the local file path for upload
    modalDefaultUploadPath: '',         // Path used for the upload path to azure in the upload modal
    searchSpinnerDisplay: false,        // Should the 'searching for a container' spinner be displayed
    newContainerName: '',               // Placeholder property for the 'create a container' action
    searchQuery: '',                    // Search query for containers
    blobsLoading: true,                 // Are we loading blobs
    selectedBlob: null,                 // DS.Record of the currently selected blob

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
    /**
     * Either all containers in the model or, if a container search query is set,
     * all the containers matching the query.
     * @return {Promise}
     */
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

    /**
     * Composes the current "faked" path
     * @return {string}
     */
    currentPath: function () {
        var path = '';
        var first = true;
        this.get('pathSegments').forEach(segment => {
            // the first slash should be skipped
            if (first) {
                first = false;
                return;
            }

            path += segment.name;
        });

        return path;
    }.property('pathSegments'),

    // Observers
    // ------------------------------------------------------------------------------
    /**
     * Observes the currently selected container and responds to changes by
     * setting up blobs
     */
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
                appInsights.trackMetric('BlobsInContainer', blobs.length);

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

                appInsights.trackMetric('BlobsInContainer', blobs.length);
            });
        }
    }.observes('containers', 'activeContainer', 'model'),

    pathSegmentObserver : function () {
        this.set('subDirectories', []);
    }.observes('pathSegments'),

    // Actions
    // ------------------------------------------------------------------------------
    actions: {
        /**
         * Handle a file dragged into the window (by uploading it)
         */
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

            // Ugh: https://github.com/Dogfalo/materialize/issues/1532
            var overlay = Ember.$('#lean-overlay');
            overlay.detach();
            Ember.$('.explorer-container').after(overlay);

            self.set('modalFileUploadPath', sourcePaths);

            self.store.find('container', activeContainer).then(result => {
                self.set('modalDefaultUploadPath', result.get('name') + ':/' + self.get('currentPath'));
            });

            appInsights.trackEvent('handleFileDragDrop');
        },

        /**
         * Switch the active container, plus minor housekeeping
         * @param  {DS.Record Container} selectedContainer - The container to be selected
         */
        switchActiveContainer: function (selectedContainer) {
            // reset all blobs selected flag
            if (selectedContainer === this.get('activeContainer')) {
                return;
            }
            this.set('pathSegments', [{ name: '/' }]);
            this.set('allBlobSelected', false);
            this.set('activeContainer', selectedContainer);

            appInsights.trackEvent('switchActiveContainer');
        },

        /**
         * Upload one or multiple files to blobs
         * @param  {Array} filePaths  - Local file paths of the files to upload
         * @param  {string} azurePath - Remote Azure Storage path
         */
        uploadBlobData: function (filePaths, azurePath) {
            var self = this,
                activeContainer = this.get('activeContainer'),
                containerPath = azurePath.replace(/.*\:\//, ''),
                paths = filePaths.split(';');

            self.store.find('container', activeContainer).then(foundContainer => {
                var promises = [];

                paths.forEach(path => {

                    var uploadNotification,
                        speedSummary,
                        uploadPromise,
                        progressUpdateInterval,
                        fileName;

                    fileName = path.replace(/^.*[\\\/]/, '');
                    var promise = foundContainer.uploadBlob(path, containerPath + fileName)
                    .then(result => {
                        speedSummary = result.speedSummary.summary;
                        uploadPromise = result.promise;

                        progressUpdateInterval = setInterval(() => {
                            if (speedSummary) {
                                // don't report a dead speed. this api reports a speed of 0 for small blobs
                                var speed = speedSummary.getSpeed() === '0B/S' ? '' : speedSummary.getSpeed();

                                uploadNotification.set('progress', speedSummary.getCompletePercent());
                                uploadNotification.set('text', stringResources.uploadMessage(fileName, azurePath, speed, speedSummary.getCompletePercent()));
                            }
                        },
                        200);

                        uploadNotification = Notification.create({
                            type: 'Upload',
                            text: stringResources.uploadMessage(fileName, azurePath),
                            cleanup: function () {
                                clearInterval(this.get('customData').progressUpdateInterval);
                            },
                            customData: {
                                progressUpdateInterval: progressUpdateInterval
                            }
                        });

                        self.get('notifications').addPromiseNotification(result.promise, uploadNotification);

                        return uploadPromise;
                    });

                    promises.push(promise);
                });

                appInsights.trackEvent('uploadBlobData');
                appInsights.trackMetric('uploadBlobs', paths.length);

                return Ember.RSVP.all(promises);
            }).then(() => {
                self.send('refreshBlobs');
            });
        },

        /**
         * Change the current "faked" directory
         * @param  {string} directory
         */
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

            appInsights.trackEvent('changeDirectory');
        },

        /**
         * Change the current "faked" sub directory
         * @param  {string} directory
         */
        changeSubDirectory: function (directory) {
            var pathSegs = [{name: '/'}];

            // we have recieved a literal path
            directory.name.split('/').forEach(segment => {
                if (segment === '') {
                    return;
                }

                pathSegs.push({name: segment + '/'});
            });

            this.set('pathSegments', pathSegs);
            this.send('refreshBlobs');
        },

        /**
         * Open the upload file modal
         */
        uploadBlob: function () {
            var nwInput = Ember.$('#nwUploadFile'),
                activeContainer = this.get('activeContainer'),
                self = this;

            nwInput.change(function () {
                nwInput.off('change');
                Ember.$('#modal-upload').openModal();

                // Ugh: https://github.com/Dogfalo/materialize/issues/1532
                var overlay = Ember.$('#lean-overlay');
                overlay.detach();
                Ember.$('.explorer-container').after(overlay);

                self.set('modalFileUploadPath', this.value);

                self.store.find('container', activeContainer).then(result => {
                    self.set('modalDefaultUploadPath', result.get('name') + ':/' + self.get('currentPath'));
                });

                // Ensure event fires
                this.value = '';
            });

            nwInput.click();

            appInsights.trackEvent('uploadBlob');
        },

        /**
         * Select all blobs in the current view
         */
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

            appInsights.trackEvent('selectAllBlobs');
        },

        /**
         * Download all the selected blobs in a directory.
         * Directory parameter is a test hook for automation.
         * @param  {string} directory
         */
        downloadBlobs: function (directory) {

            var nwInput = Ember.$('#nwSaveInput'),
                blobs = this.get('blobs'),
                handleInputDirectory,
                self = this,
                selectedBlobs = [];

            nwInput.attr('nwsaveas', 'directory');

            handleInputDirectory = function (dir) {
                selectedBlobs.forEach(function (blob) {
                    // Check if this one is marked for download
                    if (blob.get('selected')) {
                        var fileName = blob.get('name').replace(/^.*[\\\/]/, ''),
                            targetPath = dir + '/' + fileName,
                            downloadPromise = { isFulfilled : false },
                            downloadNotification,
                            speedSummary,
                            progressUpdateInterval;

                        blob.toFile(targetPath)
                        .then(result => {

                            speedSummary = result.speedSummary.summary;
                            downloadPromise = result.promise;

                            progressUpdateInterval = setInterval(() => {
                                if (speedSummary) {
                                    // don't report a dead speed. this api reports a speed of 0 for small blobs
                                    var speed = speedSummary.getSpeed() === '0B/S' ? '' : speedSummary.getSpeed();

                                    downloadNotification.set('progress', speedSummary.getCompletePercent());
                                    downloadNotification.set('text', stringResources.downloadMessage(blob.get('name'), speed, speedSummary.getCompletePercent()));
                                }
                            },
                            200);

                            downloadNotification = Notification.create({
                                type: 'Download',
                                text: stringResources.downloadMessage(blob.get('name')),
                                cleanup: function () {
                                    clearInterval(this.get('customData').progressUpdateInterval);
                                },
                                customData: {
                                    progressUpdateInterval: progressUpdateInterval
                                }
                            });
                            self.get('notifications').addPromiseNotification(downloadPromise, downloadNotification);

                            return downloadPromise;
                        });
                    }
                });
            };

            // Check the number of selected blobs, but only count to 2
            blobs.forEach(function (blob) {
                if (blob.get('selected')) {
                    selectedBlobs.push(blob);
                }
            });

            // If no blobs are selected we don't need to show the native dialog
            if (selectedBlobs.length > 0) {
                nwInput = (selectedBlobs.length > 1) ? Ember.$('#nwSaveDirectory') : Ember.$('#nwSaveInput');

                if (selectedBlobs.length === 1) {
                    nwInput.attr('nwsaveas', selectedBlobs[0].get('name'));
                }

                // Native dialog won't work in automation so skip in automation
                if (!directory) {
                    nwInput.change(function () {
                        handleInputDirectory(this.value);
                        // Reset value to ensure change event always fires
                        this.value = '';
                        nwInput.off('change');
                    });
                    nwInput.click();
                } else {
                    handleInputDirectory(directory);
                }
            }

            appInsights.trackEvent('downloadBlobs');
        },

        /**
         * Mark a given blob as selected
         * @param  {DS.Record} blob
         */
        selectBlob: function (blob) {
            this.set('selectedBlob', blob);
        },

        /**
         * Open the 'delete blobs' modal.
         */
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

            // Ugh: https://github.com/Dogfalo/materialize/issues/1532
            var overlay = Ember.$('#lean-overlay');
            overlay.detach();
            Ember.$('.explorer-container').after(overlay);

            appInsights.trackEvent('deleteBlobs');
        },

        /**
         * Delete all the selected blobs
         */
        deleteBlobData: function () {
            var blobs = this.get('blobs'),
                self = this;

            blobs.forEach(function (blob) {
                // check if this one is marked for deleting
                if (blob.get('selected')) {
                    blob.deleteRecord();
                    self.get('notifications').addPromiseNotification(blob.save(),
                        Notification.create({
                            type: 'DeleteBlob',
                            text: stringResources.deleteBlobMessage(blob.get('name'))
                        })
                    );
                    if (blob === self.get('selectedBlob')) {
                        self.set('selectBlob', null);
                    }
                }
            });

            this.set('blobs', blobs);
        },

        /**
         * Refresh the current blobs. Useful if the blobs have changed.
         */
        refreshBlobs: function () {
            var blobs = [],
                self = this;

            this.store.find('container', this.get('activeContainer')).then(result => {
                if (result) {
                    result.set('blobPrefixFilter', self.get('currentPath'));
                    blobs = result.get('blobs');
                } else {
                    blobs = [];
                }

                self.set('blobs', blobs);
                self.set('blobsLoading', false);
                return result;
            }).then(container => {
                return container.listDirectoriesWithPrefix(self.get('currentPath'));
            }).then(result => {
                var subDirs = [];
                result.forEach(dir => {
                    subDirs.push({
                        name: dir.name
                    });
                });
                self.set('subDirectories', subDirs);
            });

            appInsights.trackEvent('refreshBlobs');
        },

        /**
         * Open the 'add container' modal.
         */
        addContainer: function () {
            this.set('newContainerName', '');

            Ember.$('#modal-addcontainer').openModal();

            // Ugh: https://github.com/Dogfalo/materialize/issues/1532
            var overlay = Ember.$('#lean-overlay');
            overlay.detach();
            Ember.$('.explorer-container').after(overlay);
        },

        /**
         * Create a new container
         */
        addContainerData: function () {
            var newContainer = this.store.createRecord('container', {
                name: this.get('newContainerName'),
                id: this.get('newContainerName')
            });
            // Todo - Ember data will assert and not return a promise if the
            // container name already exists (since we are using it as an id)
            this.get('notifications').addPromiseNotification(newContainer.save(), Notification.create(
                {
                    type: 'AddContainer',
                    text: stringResources.addContainerMessage(this.get('newContainerName'))
                })
            );
        },

        /**
         * Go back to the welcome screen
         */
        goHome: function () {
            this.transitionToRoute('welcome');
        }
    }
});
