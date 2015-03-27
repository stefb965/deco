import DS from 'ember-data';
import accountUtil from '../utilities/account';
import seriliazer from '../serializers/azure-storage';
export default DS.Adapter.extend({
    seriliazer: seriliazer.create(),
    find: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.getBlobProperties(snapshot.get('container').name, snapshot.get('name'), function (error, result) {
                    if (error) {
                        return Ember.run(null, reject, error);
                    }
                    return Ember.run(null, resolve, result);
                });
            });
        });
    },
    createRecord: function () {
        throw 'not implemented ';
    },
    updateRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azurestorage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.setBlobProperties(snapshot.get('name'), {
                    name: snapshot.get('name')
                }, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, data);
                });
            });
        });
    },
    deleteRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.deleteBlob(snapshot.blob, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, data);
                });
            });
        });
    },
    findAll: function () {
        throw 'not implemented';
    },
    findQuery: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.listBlobsSegmented(snapshot.container_id, null, function (error, result) {
                    if (error) {
                        return Ember.run(null, reject, error);
                    }
                    var blobs = [];
                    // fill out the blob models

                    for (var i in result.entries) {
                        if (i % 1 === 0) {
                            blobs.push({
                                id: result.entries[i].name,
                                name: result.entries[i].name,
                                size: result.entries[i].properties['content-length'],
                                type: result.entries[i].properties['content-type'],
                                lastModified: result.entries[i].properties['last-modified'],
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
