import DS from 'ember-data';
import accountUtil from '../utils/account';

/**
 * Ember-Data Model for containers
 */
var Container = DS.Model.extend({
    nodeServices: Ember.inject.service(),       // Node services (injected)
    blobPrefixFilter: DS.attr('string', {       // Filters result of blobs property
        defaultValue: ''
    }),
    name: DS.attr('string', {                   // Name of the container
        defaultValue: ''
    }),
    lastModified: DS.attr('date', {             // Timestamp: Last modified
        defaultValue: ''
    }),
    publicAccessLevel: ('string', {             // Public access level of the container
        defaultValue: null
    }),

    /**
     * Returns all the blobs in this container, accounting for faked folders
     */
    blobs: function () {
        return this.store.find('blob', {
            container: this,
            container_id: this.get('name'),
            prefix: this.get('blobPrefixFilter')
        });
    }.property().volatile(),

    /**
     * Lists the "faked" directories for this container
     * @param  {string} prefix - Which prefix to use
     */
    listDirectoriesWithPrefix: function (prefix) {
        var self = this;

        return accountUtil.getBlobService(self.store, self.get('azureStorage'))
        .then(blobService => {
            var listBlobDirectoriesSegmentedWithPrefix = Ember.RSVP.denodeify(blobService.listBlobDirectoriesSegmentedWithPrefix);
            return listBlobDirectoriesSegmentedWithPrefix.call(blobService, self.get('name'), prefix, null);
        })
        .then(result => {
            var entries = [];
            result.entries.forEach(dir => {
                // our own directory is not a subdirectory of itself
                // azure api will return it though - so filter it
                if (dir.name !== prefix) {
                    entries.push(dir);
                }
            });

            return entries;
        })
        .catch (error => {
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
            self = this,
            speedSummary = {summary: null};

        return accountUtil.getBlobService(self.store, self.get('azureStorage'))
        .then(blobService => {
            var SpeedSummary = self.get('azureStorage').BlobService.SpeedSummary,
                createBlockBlobFromLocalFile = Ember.RSVP.denodeify(blobService.createBlockBlobFromLocalFile);

            speedSummary.summary = new SpeedSummary();

            var promise = createBlockBlobFromLocalFile.call(blobService, container, blobName, path,
                    {speedSummary: speedSummary.summary})
                .then(response => {
                    return response.entries;
                })
                .catch (error => {
                    appInsights.trackException(error);
                });

            return {
                promise: promise,
                speedSummary: speedSummary
            };
        })
        .catch (error => {
            appInsights.trackException(error);
        });
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});

export default Container;
