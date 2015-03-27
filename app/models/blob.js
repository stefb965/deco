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
    toStream: function (store) {
        accountUtil.getActiveAccount(store).then(function (account) {
            var azureStorage = window.requireNode('azure-storage');
            var blobService = azureStorage.createBlobService(account.get('name'),
                account.get('key'));
            var memorystream = window.requireNode('memorystream');
            return new Ember.RSVP.Promise(function (resolve, reject) {
                blobService.getBlobToStream(this.get('container').get('name'), this.get('name'), memorystream, function (err) {
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
                console.dir(self.get('container'));
                console.dir(self.container.get('name'));
                blobService.getBlobToStream(self.container.get('name'), self.get('name'), fs.createWriteStream(path), function (err) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, null);
                });
            });
        });
    }
});
