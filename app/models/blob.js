import DS from 'ember-data';
import accountUtil from '../utilities/account';

function startWriteToStream(model, stream) {
    accountUtil.getActiveAccount(model.store).then(function (account) {
        var blobService = model.get('azureStorage').createBlobService(account.get('name'),
            account.get('key'));
        blobService.getBlobToStream(model.get('container_id'), model.get('name'), stream, function (err) {
            if (err) {
                Ember.Logger.error('Error getting blob to stream:');
                Ember.Logger.error(err);
            }
        });
    });
}

export default DS.Model.extend({
    container: DS.belongsTo('container', {
        async: true
    }),
    nodeServices: Ember.inject.service(),
    fileSystem: Ember.inject.service(),
    name: DS.attr('string'),
    size: DS.attr('number'),
    lastModified: DS.attr('date'),
    container_id: DS.attr('string'),
    type: DS.attr('string'),

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

    // returns stream to blob path
    toFile: function (path) {
        var fileStream = this.get('fileSvc').createWriteStream(path);
        // begin writing to stream
        startWriteToStream(this, fileStream);
        return fileStream;
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage'),
    fileSvc: Ember.computed.alias('nodeServices.fs')
});
