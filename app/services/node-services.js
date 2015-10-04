import Ember from 'ember';

var azureStorage = null,
    fs = null,
    path = null;

/**
 * Check if running in nw, if not, we're probably running as a test,
 * in which case this entire service will be mocked
 */
if (window.requireNode) {
    azureStorage = window.requireNode('azure-storage');
    fs = window.requireNode('fs');
    path = window.requireNode('path');
}

/**
 * Allow the injection of Node Modules as Ember Services
 */
export default Ember.Service.extend({
    azureStorage: azureStorage,
    fs: fs,
    path: path,

    /**
     * Get the currently active account
     * @param  {DS.Store} store
     * @return {Promise}
     */
    getActiveAccount: function (store) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            var accounts = store.peekAll('account'),
                length = accounts.get('length'),
                i = 0;

            accounts.forEach(function (account) {
                if (account.get('active') === true) {
                    return Ember.run(null, resolve, account);
                }
                i += 1;
                if (i >= length) {
                    return Ember.run(null, reject, 'could not find any active accounts');
                }
            });
        });
    },

    /**
     * Takes an Azure Storage SDK Result and turns it into an array of blob models
     * @param  {[object]} result   Azure Storage SDK's result
     * @param  {object} snapshot   Ember Data snapshot
     * @return {Promise}
     */
    blobModelFromAzureResult: function (result, snapshot) {
        return new Ember.RSVP.Promise(function (resolve) {
            var blobs = [];

            // Fill out the blob models
            for (var i in result.entries) {
                if (i % 1 === 0) {
                    let blobModel = {
                        id: result.entries[i].name,
                        name: result.entries[i].name,
                        size: parseInt(result.entries[i].properties['content-length']),
                        type: result.entries[i].properties['content-type'],
                        lastModified: new Date(Date.parse(result.entries[i].properties['last-modified'])),
                        container: snapshot.container,
                        leaseState: result.entries[i].properties.leasestate,
                        leaseStatus: result.entries[i].properties.leasestatus,
                        container_id: snapshot.container_id,
                        blobType: result.entries[i].properties.blobtype,
                        contentLanguage: result.entries[i].properties['content-language'],
                        contentMd5: result.entries[i].properties['content-md5'],
                        contentDisposition: result.entries[i].properties['content-disposition'],
                        leaseID: result.entries[i].properties.leaseid,
                        etag: result.entries[i].properties.etag
                    };
                    blobs.push(blobModel);
                }
            }

            resolve(blobs);
        });
    }
});
