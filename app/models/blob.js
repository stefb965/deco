import DS from 'ember-data';
import accountUtil from '../utils/account';

/**
 * Helper function: Write a blob to a Node file stream
 * @param  {DS.Model} model   - Model to query for data
 * @param  {FS Stream} stream - The stream to write to
 */
function startWriteToStream(model, stream) {
    return accountUtil.getActiveAccount(model.store).then(function (account) {
        var blobService = model.get('azureStorage').createBlobService(account.get('name'),
            account.get('key')),
            speedSummary = {summary: null};

        return {
            promise: new Ember.RSVP.Promise(function (resolve, reject) {
                        var SpeedSummary = model.get('azureStorage').BlobService.SpeedSummary;
                        speedSummary.summary = new SpeedSummary();
                        blobService.getBlobToStream(model.get('container_id'), model.get('name'), stream, {speedSummary:  speedSummary.summary},  function (err) {
                            if (err) {
                                Ember.Logger.error('Error getting blob to stream:');
                                Ember.Logger.error(err);
                                return reject(err);
                            }
                            return resolve();
                        });
                    }),
            speedSummary: speedSummary
        };
    });
}

/**
 * Ember-Data Model for blobs
 */
export default DS.Model.extend({
    container: DS.belongsTo('container', {  // The container this blob lives in
        async: true
    }),
    nodeServices: Ember.inject.service(),   // Node services (injected)
    fileSystem: Ember.inject.service(),     // Node FS service (injected)
    name: DS.attr('string'),                // Name of the blob
    size: DS.attr('number'),                // Size of the blob, in bytes
    leaseState: DS.attr('string'),          // Lease State (available/unavailable)
    leaseStatus: DS.attr('string'),         // Lease State (locked/unlocked)
    lastModified: DS.attr('date'),          // Timestamp: Last modified
    container_id: DS.attr('string'),        // ID of the container this blob lives in
    type: DS.attr('string'),                // Filetype of the blob (example: image/png)
    selected: DS.attr('boolean'),           // Is this blob selected?

    /**
     * Get a public URL to the blob
     * @return {Promise}
     */
    getLink: function () {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve) {
            accountUtil.getActiveAccount(self.store).then(function (account) {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'), account.get('key'));
                var startDate = new Date();
                var expiryDate = new Date(startDate);

                // set the link expiration to 200 minutes in the future.
                expiryDate.setMinutes(startDate.getMinutes() + 200);
                startDate.setMinutes(startDate.getMinutes() - 100);

                var sharedAccessPolicy = {
                    AccessPolicy: {
                        Permissions: self.get('azureStorage').BlobUtilities.SharedAccessPermissions.READ,
                        Start: startDate,
                        Expiry: expiryDate
                    }
                };

                var token = blobService.generateSharedAccessSignature(self.get('container_id'), self.get('name'), sharedAccessPolicy);
                // generate a url in which the user can have access to the blob
                var sasUrl = blobService.getUrl(self.get('container_id'), self.get('name'), token);

                return Ember.run(null, resolve, sasUrl);
            });
        });
    },

    /**
     * Returns stream to blob path
     * @param  {string} path - Path to write to
     */
    toFile: function (path) {
        var fileStream = this.get('fileSvc').createWriteStream(path);
        // begin writing to stream
        return startWriteToStream(this, fileStream);
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage'),
    fileSvc: Ember.computed.alias('nodeServices.fs')
});
