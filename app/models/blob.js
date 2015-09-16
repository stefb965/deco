import DS from 'ember-data';
import accountUtil from '../utils/account';
import Ember from 'ember';
/**
 * Helper function: Write a blob to a Node file stream
 * @param  {DS.Model} model   - Model to query for data
 * @param  {FS Stream} stream - The stream to write to
 */
function startWriteToStream(model, stream, blobService) {
    var speedSummary = {
            summary: null
        },
        SpeedSummary = model.get('azureStorage').BlobService.SpeedSummary,
        getBlobToStream = Ember.RSVP.denodeify(blobService.getBlobToStream);

    speedSummary.summary = new SpeedSummary();

    var promise = getBlobToStream.call(blobService, model.get('container_id'),
        model.get('name'), stream, {
            speedSummary: speedSummary.summary
        });
    return {
        promise: promise,
        speedSummary: speedSummary
    };
}

/**
 * Ember-Data Model for blobs
 */
export default DS.Model.extend({
    container: DS.belongsTo('container', { // The container this blob lives in
        async: true
    }),
    nodeServices: Ember.inject.service(), // Node services (injected)
    fileSystem: Ember.inject.service(), // Node FS service (injected)
    name: DS.attr('string'), // Name of the blob
    size: DS.attr('number'), // Size of the blob, in bytes
    leaseState: DS.attr('string'), // Lease State (available/unavailable)
    leaseStatus: DS.attr('string'), // Lease State (locked/unlocked)
    lastModified: DS.attr('date'), // Timestamp: Last modified
    container_id: DS.attr('string'), // ID of the container this blob lives in
    blobType: DS.attr('string'), // Blob Type (Page/Block Blob)
    contentLanguage: DS.attr('string'), // Content Language
    contentDisposition: DS.attr('string'), // Content Disposition
    contentMd5: DS.attr('string'), // Content MD5
    type: DS.attr('string'), // Filetype of the blob (example: image/png)
    selected: DS.attr('boolean'), // Is this blob selected?
    pageRanges: DS.attr(), // Array of {start: , end: } ranges

    /**
     * Get a public URL to the blob
     * @param  {string} permissions READ|WRITE|DELETE|LIST
     * @return {Promise}
     */
    getLink: function (expiry = 200, permissions = 'READ') {
        var self = this;
        return accountUtil.getBlobService(self.store, self.get('azureStorage'))
            .then(blobService => {
                var startDate = new Date();
                var expiryDate = new Date(startDate);
                // set the link expiration to 200 minutes in the future.
                expiryDate.setMinutes(startDate.getMinutes() + expiry);
                startDate.setMinutes(startDate.getMinutes() - 100);

                var sharedAccessPolicy = {
                    AccessPolicy: {
                        Permissions: self.get('azureStorage').BlobUtilities.SharedAccessPermissions[permissions],
                        Start: startDate,
                        Expiry: expiryDate
                    }
                };

                var token = blobService.generateSharedAccessSignature(self.get('container_id'), self.get('name'), sharedAccessPolicy);
                // generate a url in which the user can have access to the blob
                var sasUrl = blobService.getUrl(self.get('container_id'), self.get('name'), token);

                return {
                    sas: token,
                    url: sasUrl
                };
            })
            .catch(error => {
                Ember.Logger.error(error);
                appInsights.trackException(error);
            });
    },

    /**
     * Returns stream to blob path
     * @param  {string} path - Path to write to
     */
    toFile: function (path) {
        var fileStream = this.get('fileSvc').createWriteStream(path),
            self = this;
        // begin writing to stream
        return accountUtil.getBlobService(self.store, self.get('azureStorage'))
            .then(blobService => {
                return startWriteToStream(self, fileStream, blobService);
            })
            .catch(error => {
                Ember.Logger.error(error);
                appInsights.trackException(error);
            });
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage'),
    fileSvc: Ember.computed.alias('nodeServices.fs')
});
