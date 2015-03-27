import DS from 'ember-data';
import serializer from '../serializers/azure-storage';
import accountUtils from '../utilities/account';
export default DS.Adapter.extend({
    serializer: serializer.create(),
    find: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage'),
            blobService = azureStorage.createBlobService(store.account_name, store.account_key);

        return new Ember.RSVP.Promise(function (resolve, reject) {
            blobService.getBlobProperties(snapshot.get('container').name, snapshot.get('name'), function (error, result) {
                if (error) {
                    return Ember.run(null, reject, error);
                }
                return Ember.run(null, resolve, result);
            });
        });
    },
    createRecord: function () {
        throw 'not implemented ';
    },
    updateRecord: function () {
        throw 'not implemented';
    },
    deleteRecord: function () {
        throw 'not implemented';
    },
    findAll: function () {
        throw 'not implemented';
    },
    findQuery: function (store, type, snapshot) {

        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'), account.get('key'));
                blobService.listBlobsSegmented(snapshot.container.get('name'), null, function (error, result) {
                    var blobs = [];
                    if (error) {
                        return Ember.run(null, reject, error);
                    }
                    // Fill out the blob models
                    for (var i in result.entries) {
                        if (i % 1 === 0) {
                            blobs.push({
                                id: result.entries[i].name,
                                name: result.entries[i].name,
                                size: result.entries[i].properties['content-length'],
                                type: result.entries[i].properties['content-type'],
                                lastModified: result.entries[i].properties['last-modified'],
                                container: snapshot.container,
                                container_id: snapshot.container_id
                            });
                        }
                    }
                    return Ember.run(null, resolve, blobs);
                });
            });
        });
    }
});
