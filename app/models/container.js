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
        var service;

        return new Ember.RSVP.Promise((resolve, reject) => {
            accountUtil.getActiveAccount(self.store).then(account => {
                service = self.get('azureStorage').createBlobService(account.get('name'), account.get('key'));
                service.listBlobDirectoriesSegmentedWithPrefix(self.get('name'), prefix, null, (err, result) => {
                    if (err) {
                        return reject(err);
                    }

                    var entries = [];
                    result.entries.forEach(dir => {
                        // our own directory is not a subdirectory of itself
                        // azure api will return it though - so filter it
                        if (dir.name !== prefix) {
                            entries.push(dir);
                        }
                    });

                    return resolve(entries);
                });
            });
        });
    },

    /**
     * Upload a blob to this container
     * @param  {string} path     - Where is the file?
     * @param  {string} blobName - Name of the blob that will be created
     */
    uploadBlob: function (path, blobName) {
        var container = this.get('name');
        var self = this;
        var service;

        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(self.store).then(account => {
                service = self.get('azureStorage').createBlobService(account.get('name'), account.get('key'));
                service.createBlockBlobFromLocalFile(container, blobName, path, (err, result, response) => {
                    if (!err) {
                        return resolve(response.entries);
                    } else {
                        return reject(err);
                    }
                });
            });
        });
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});

export default Container;
