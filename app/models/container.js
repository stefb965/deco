import DS from 'ember-data';
import accountUtil from '../utils/account';

/**
 * Ember-Data Model for containers
 */
var Container = DS.Model.extend({
    nodeServices: Ember.inject.service(), // Node services (injected)
    blobPrefixFilter: DS.attr('string', { // Filters result of blobs property
        defaultValue: ''
    }),
    name: DS.attr('string', { // Name of the container
        defaultValue: ''
    }),
    etag: DS.attr('string', {
        defaultValue: ''
    }),
    lastModified: DS.attr('date', { // Timestamp: Last modified
        defaultValue: ''
    }),
    leaseStatus: DS.attr('string', {
        defaultValue: ''
    }),
    leaseState: DS.attr('string', {
        defaultValue: ''
    }),
    publicAccessLevel: DS.attr('string', { // Public access level of the container
        defaultValue: null
    }),
    currentToken: DS.attr('string', { // If we didn't grab all blobs for this container, this is the token to fetch more records
        defaultValue: null
    }),

    /**
     * Returns all the blobs in this container, accounting for faked folders
     */
    blobs: function () {
        this.set('currentToken', null);

        return this.store.find('blob', {
            container: this,
            container_id: this.get('name'),
            prefix: this.get('blobPrefixFilter')
        });
    }.property().volatile(),

    /**
     * Tries to fetch more blobs using a continuation token
     */
    fetchMoreBlobs: function () {
        return new Ember.RSVP.Promise((resolve) => {
            // Bail out if we couldn't fetch more blobs
            if (!this.get('currentToken')) {
                return resolve();
            }

            return this.store.find('blob', {
                container: this,
                container_id: this.get('name'),
                prefix: this.get('blobPrefixFilter'),
                currentToken: this.get('currentToken')
            }).then((result) => {
                resolve(result);
            });
        });
    },

    /**
     * Lists the "faked" directories for this container
     * @param  {string} prefix - Which prefix to use
     */
    listDirectoriesWithPrefix: function (prefix) {
        return accountUtil.getBlobService(this.store, this.get('azureStorage')).then(blobService => {
            var listBlobDirectoriesSegmentedWithPrefix = Ember.RSVP.denodeify(blobService.listBlobDirectoriesSegmentedWithPrefix);
            return listBlobDirectoriesSegmentedWithPrefix.call(blobService, this.get('name'), prefix, null);
        }).then(result => {
            var entries = [];
            result.entries.forEach(dir => {
                // our own directory is not a subdirectory of itself
                // azure api will return it though - so filter it
                if (dir.name !== prefix) {
                    entries.push(dir);
                }
            });

            return entries;
        }).catch(error => {
            appInsights.trackException(error);
        });
    },

    /**
     * Upload a blob to this container
     * @param  {string} path     - Where is the file?
     * @param  {string} blobName - Name of the blob that will be created
     * @return {object} - An object containing a promise and SpeedSummary tracking object
     */
    uploadBlob: function (path, blobName) {
        var container = this.get('name'),
            speedSummary = {
                summary: null
            };

        return accountUtil.getBlobService(this.store, this.get('azureStorage')).then(blobService => {
            var SpeedSummary = this.get('azureStorage').BlobService.SpeedSummary,
                createBlockBlobFromLocalFile = Ember.RSVP.denodeify(blobService.createBlockBlobFromLocalFile);

            speedSummary.summary = new SpeedSummary();

            var promise = createBlockBlobFromLocalFile.call(blobService, container, blobName, path, {
                speedSummary: speedSummary.summary
            }).then(response => {
                return response.entries;
            }).catch(error => {
                appInsights.trackException(error);
            });
            return {
                promise: promise,
                speedSummary: speedSummary
            };
        }).catch(error => {
            appInsights.trackException(error);
        });
    },

    /**
     * Copy a blob to this container
     * @param {string}             sourceUri                                 The source blob URI.
     * @param {string}             targetContainerName                           The target container name.
     * @param {string}             targetBlobName                                The target blob name.
     * @return {object} - An object containing a promise and SpeedSummary tracking object
     */
    copyBlob: function (sourceUri, targetContainerName, targetBlobName) {
        var speedSummary = {
            summary: null
        };

        return accountUtil.getBlobService(this.store, this.get('azureStorage')).then(blobService => {
            var SpeedSummary = this.get('azureStorage').BlobService.SpeedSummary;
            speedSummary.summary = new SpeedSummary();

            return {
                promise: new Ember.RSVP.Promise(function (resolve, reject) {
                    blobService.startCopyBlob(sourceUri, targetContainerName, targetBlobName, {
                        speedSummary: speedSummary.summary
                    }, (err, result, response) => {
                        if (!err) {
                            return resolve(response.entries);
                        } else {
                            return reject(err);
                        }
                    });
                }),
                speedSummary: speedSummary
            };
        });
    },

    /**
     * Sets this container's ACL
     * @param {string}             permissionLevel BLOB|OFF|CONTAINER
     */
    setAccessControlLevel: function (permissionLevel) {
        return accountUtil.getBlobService(this.store, this.get('azureStorage')).then(blobService => {
            var setContainerAcl = Ember.RSVP.denodeify(blobService.setContainerAcl);
            Ember.Logger.debug('setting container access level to: ');
            Ember.Logger.debug(this.get('azureStorage').BlobUtilities.BlobContainerPublicAccessType[permissionLevel]);
            return setContainerAcl.call(blobService, this.get('name'), null, this.get('azureStorage').BlobUtilities.BlobContainerPublicAccessType[permissionLevel]);
        });
    },

    /**
     * Get this container'ss ACL
     * @return {ContainerResult} - An object containing the details of the container and permissions level
     */
    getAccessControlLevel: function () {
        return accountUtil.getBlobService(this.store, this.get('azureStorage')).then(blobService => {
            var getContainerAcl = Ember.RSVP.denodeify(blobService.getContainerAcl);
            return getContainerAcl.call(blobService, this.get('name'));
        });
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});

export default Container;
