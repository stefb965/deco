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
                Ember.$('.files')[0].ondrop = e => {
                    this.send('handleFileDragDrop', e);
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
        if (!this.get('searchQuery')) {
            return this.get('model');
        } else {
            this.set('searchSpinnerDisplay', true);
            var promise = this.store.find('container', {name: this.get('searchQuery')});
            promise.then(() => this.set('searchSpinnerDisplay', false));
            return promise;
        }
    }.property('searchQuery'),

    /**
     * Composes the current "faked" path
     * @return {string}
     */
    currentPath: function () {
        var path = '';

        this.get('pathSegments').forEach((segment, index) => {
            path += (index === 0) ? '' : segment.name; // the first slash should be skipped
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
        if (!this.get('containers') || !this.get('containers').get('firstObject')) {
            return; // if there are no containers bail out (in case of empty search)
        }

        if (!this.get('activeContainer')) {
            this.set('activeContainer', this.get('containers').get('firstObject').get('id'));
        }

        var activeContainer = this.get('activeContainer'),
            blobs = [], subDirs = [];

        // clear out subdirs'
        this.set('blobsLoading', true);
        this.set('subDirectories', []);

        return this.store.find('container', activeContainer).then(result => {
            if (result) {
                result.set('blobPrefixFilter', this.get('currentPath'));
                blobs = result.get('blobs');

                result.listDirectoriesWithPrefix(this.get('currentPath')).then(result => {
                    result.forEach(dir => {
                        subDirs.push({name: dir.name, selected: false});
                    });
                    this.set('subDirectories', subDirs);
                });
            }

            this.set('blobs', blobs);
            this.set('blobsLoading', false);

            appInsights.trackMetric('BlobsInContainer', blobs.length);
        });
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

            this.set('modalFileUploadPath', sourcePaths);
            this.store.find('container', activeContainer).then(result => {
                this.set('modalDefaultUploadPath', result.get('name') + ':/' + this.get('currentPath'));
            });
            this.send('openModal', '#modal-upload');

            appInsights.trackEvent('handleFileDragDrop');
        },

        /**
         * Switch the active container, plus minor housekeeping
         * @param  {DS.Record Container} selectedContainer - The container to be selected
         */
        switchActiveContainer: function (selectedContainer) {
            if (selectedContainer === this.get('activeContainer')) {
                return;
            }
            this.set('pathSegments', [{ name: '/' }]);
            this.set('allBlobSelected', false);
            this.set('activeContainer', selectedContainer);

            appInsights.trackEvent('switchActiveContainer');
        },

        /**
         * Change the current "faked" directory, ie: the user clicked a path button
         * @param  {string} directory
         */
        changeDirectory: function (directory) {
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
         * Upload one or multiple files to blobs
         * @param  {Array} filePaths  - Local file paths of the files to upload
         * @param  {string} azurePath - Remote Azure Storage path
         */
        uploadBlobData: function (filePaths, azurePath) {
            var activeContainer = this.get('activeContainer'),
                containerPath = azurePath.replace(/.*\:\//, ''),
                paths = filePaths.split(';'), promises = [];

            this.store.find('container', activeContainer).then(foundContainer => {
                paths.forEach(path => {
                    var fileName = path.replace(/^.*[\\\/]/, ''),
                        uploadNotification, speedSummary, uploadPromise, progressUpdateInterval;

                    var promise = foundContainer.uploadBlob(path, containerPath + fileName).then(result => {
                        speedSummary = result.speedSummary.summary;
                        uploadPromise = result.promise;

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

                        progressUpdateInterval = setInterval(function() {
                            if (speedSummary) {
                                // don't report a dead speed. this api reports a speed of 0 for small blobs
                                var speed = speedSummary.getSpeed() === '0B/S' ? '' : speedSummary.getSpeed();

                                uploadNotification.set('progress', speedSummary.getCompletePercent());
                                uploadNotification.set('text', stringResources.uploadMessage(fileName, azurePath, speed, speedSummary.getCompletePercent()));
                            }
                        }, 200);

                        this.get('notifications').addPromiseNotification(result.promise, uploadNotification);
                        return uploadPromise;
                    });

                    promises.push(promise);
                });

                appInsights.trackEvent('uploadBlobData');
                appInsights.trackMetric('uploadBlobs', paths.length);

                return Ember.RSVP.all(promises);
            }).then(() => {
                this.send('refreshBlobs');
            });
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
                
                self.set('modalFileUploadPath', this.value);
                self.store.find('container', activeContainer).then(result => {
                    self.set('modalDefaultUploadPath', result.get('name') + ':/' + self.get('currentPath'));
                });
                self.send('openModal', '#modal-upload');

                this.value = ''; // Ensure event fires
            });

            nwInput.click();

            appInsights.trackEvent('uploadBlob');
        },

        /**
         * Select all blobs in the current view
         */
        selectAllBlobs: function () {
            this.get('blobs').forEach(blob => {
                if (!this.get('allBlobSelected')) {
                    blob.set('selected', true);
                } else {
                    blob.set('selected', false);
                }
            });

            this.toggleProperty('allBlobSelected');

            appInsights.trackEvent('selectAllBlobs');
        },

        /**
         * Takes an array of blobs and streams them to a target directory
         * @param  {array} blobs        - Blobs to download
         * @param  {string} directory   - Local directory to save them to
         * @param  {boolean} saveAs     - Is the target a directory or a filename (saveAs)?
         */
        streamBlobsToDirectory: function (blobs, directory, saveAs) {
            blobs.forEach(blob => {
                var fileName = blob.get('name').replace(/^.*[\\\/]/, ''),
                    targetPath = (saveAs) ? directory : directory + '/' + fileName,
                    downloadPromise = {isFulfilled : false},
                    downloadNotification, speedSummary, progressUpdateInterval;

                blob.toFile(targetPath).then(result => {
                    speedSummary = result.speedSummary.summary;
                    downloadPromise = result.promise;

                    progressUpdateInterval = setInterval(() => {
                        if (speedSummary) {
                            // Don't report a dead speed. This api reports a speed of 0 for small blobs
                            var speed = speedSummary.getSpeed() === '0B/S' ? '' : speedSummary.getSpeed();
                            downloadNotification.set('progress', speedSummary.getCompletePercent());
                            downloadNotification.set('text', stringResources.downloadMessage(blob.get('name'), speed, speedSummary.getCompletePercent()));
                        }
                    }, 200);

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

                    this.get('notifications').addPromiseNotification(downloadPromise, downloadNotification);
                    return downloadPromise;
                });
            });
        },

        /**
         * Download all the selected blobs.
         * Directory parameter is a test hook for automation.
         * @param  {string} targetDirectory
         */
        downloadBlobs: function (targetDirectory) {
            var blobs = this.get('blobs'),
                subDirectories = this.get('subDirectories'),
                selectedBlobs = blobs.filterBy('selected', true),
                selectedDirectories = subDirectories.filter(directory => directory.selected),
                getBlobPromises = [], self = this, nwInput;

            appInsights.trackEvent('downloadBlobs');

            /**
             * Action-scope download function
             */
            var executeDownload = function () {
                if (selectedBlobs.length > 0) {
                    nwInput = (selectedBlobs.length > 1) ? Ember.$('#nwSaveDirectory') : Ember.$('#nwSaveInput');

                    if (selectedBlobs.length === 1) {
                        nwInput.attr('nwsaveas', selectedBlobs[0].get('name'));
                    }

                    if (!targetDirectory) {
                        nwInput.change(function () {
                            self.send('streamBlobsToDirectory', selectedBlobs, this.value, (selectedBlobs.length === 1));
                            this.value = ''; // Reset value to ensure change event always fires
                            nwInput.off('change');
                        });

                        nwInput.click();
                    } else {
                        self.send('streamBlobsToDirectory', selectedBlobs, targetDirectory, (selectedBlobs.length === 1));
                    }
                }
            };

            if (selectedDirectories.length < 1) {
                return executeDownload();
            }

            this.store.find('container', this.get('activeContainer')).then(container => {
                selectedDirectories.forEach(directory => {
                    getBlobPromises.push(this.store.find('blob', {
                        container: container,
                        container_id: container.get('id'),
                        prefix: directory.name
                    }).then(blobs => {
                        blobs.forEach(blob => {
                            selectedBlobs.push(blob);
                        });
                    }));
                });

                Ember.RSVP.all(getBlobPromises).then(function () {
                    executeDownload();
                });
            });
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
                folderDeleteCount = 0,
                blobDeleteCount = 0,
                deleteText;

            // Count folder and blobs to delete
            this.get('subDirectories').forEach(directory => {
                if (directory.selected) {
                    folderDeleteCount += 1;
                }
            });
            blobs.forEach(blob => {
                if (blob.get('selected')) {
                    blobDeleteCount += 1;
                }
            });

            // Bail out if we have nothing to delete
            if (blobDeleteCount < 1 && folderDeleteCount < 1) {
                return;
            }

            // Setup values expected by delete modal
            if (blobDeleteCount > 0 && folderDeleteCount > 0) {
                deleteText = `${blobDeleteCount} blob(s) and ${folderDeleteCount} folder(s)`;
            } else if (blobDeleteCount > 0) {
                deleteText = `${blobDeleteCount} blob(s)`;
            } else if (folderDeleteCount > 0) {
                deleteText = `${folderDeleteCount} folder(s)`;
            }
            this.set('modalConfirmAction', 'deleteBlobData');
            this.set('modalDeleteText', deleteText);

            // Open delete prompt
            Ember.$('#modal-delete').openModal();

            // Ugh: https://github.com/Dogfalo/materialize/issues/1532
            var overlay = Ember.$('#lean-overlay');
            overlay.detach();
            Ember.$('.explorer-container').after(overlay);

            appInsights.trackEvent('deleteBlobs');
        },

        /**
         * Delete all the blobs in a given "faked" folder
         * for the current container
         * @param  {string} folder - The folder to delete
         */
        deleteFolderBlobs: function (folder) {
            this.store.find('container', this.get('activeContainer')).then(container => {
                this.store.find('blob', {
                    container: container,
                    container_id: container.get('id'),
                    prefix: folder
                }).then(blobs => {
                    blobs.forEach(blob => {
                        blob.destroyRecord();
                        this.get('notifications').addPromiseNotification(blob.save(),
                            Notification.create({
                                type: 'DeleteBlob',
                                text: stringResources.deleteBlobMessage(blob.get('name'))
                            })
                        );
                    });

                    this.set('subDirectories', []);
                    this.send('refreshBlobs');
                });
            });
        },

        /**
         * Delete all the selected blobs, including potentially selected folders
         */
        deleteBlobData: function () {
            this.get('blobs').forEach(blob => {
                if (blob.get('selected')) {
                    blob.deleteRecord();
                    this.get('notifications').addPromiseNotification(blob.save(),
                        Notification.create({
                            type: 'DeleteBlob',
                            text: stringResources.deleteBlobMessage(blob.get('name'))
                        })
                    );
                }
            });

            this.get('subDirectories').forEach(directory => {
                if (directory.selected) {
                    this.send('deleteFolderBlobs', directory.name);
                }
            });

            this.set('selectBlob', null);
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
