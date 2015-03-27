import DS from 'ember-data';
import accountUtil from '../utilities/account';
export default DS.Model.extend({
    container: DS.belongsTo('container', {
        async: true
    }),
    name: DS.attr('string'),
    size: DS.attr('number'),
    lastModified: DS.attr('date'),
    container_id: DS.attr('string'),
    type: DS.attr('string'),
    // returns a stream of the blob
    toStream: function () {

        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(self.store).then(function (account) {
                var azureStorage = window.requireNode('azure-storage');
                var memorystream = window.requireNode('memorystream');
                var blobService = azureStorage.createBlobService(account.
                    get('name'),
                    account.get('key'));

                blobService.getBlobToStream(self.get('container_id'), self.get('name'), memorystream, function (err) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, memorystream);
                });
            });
        });
    },
    // writes blob to the path provided
    toFile: function (path) {
        var assert = window.requireNode('assert');
        assert(path !== null || path !== undefined, 'argument path does not exist');
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(self.store).then(function (account) {
                var azureStorage = window.requireNode('azure-storage');
                var fs = window.requireNode('fs');
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));

                blobService.getBlobToStream(self.get('container_id'), self.get('name'), fs.createWriteStream(path), function (err) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, null);
                });
            });
        });
    }
});
