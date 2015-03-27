import DS from 'ember-data';
import serializer from '../serializers/azure-storage';
import accountUtils from '../utilities/account';
export default DS.Adapter.extend({
    serializer: serializer.create(),
    find: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.getContainerProperties(snapshot.name, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }

                    return Ember.run(null, resolve, [{
                        name: data.name,
                        id: data.name,
                        lastModified: new Date(Date.parse(data.lastModified))
                    }]);
                });
            });
        });
    },
    createRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.createContainerIfNotExists(snapshot.get('name'), function (err) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, snapshot);
                });
            });
        });
    },
    updateRecord: function () {
        throw 'not implemented';
    },
    deleteRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.deleteContainer(snapshot.get('name'), function (err) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, null);
                });
            });
        });
    },
    findAll: function (store) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.listContainersSegmented(null, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    var containerModels = [];
                    for (var i in data.entries) {
                        if (i % 1 === 0) {
                            containerModels.push({
                                id: data.entries[i].name,
                                name: data.entries[i].name,
                                lastModified: new Date(Date.parse(data.entries[i].properties['last-modified']))
                            });
                        }
                    }
                    return Ember.run(null, resolve, containerModels);
                });
            });
        });
    },
    findQuery: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.getContainerProperties(snapshot.name, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, [{
                        name: data.name,
                        id: data.name,
                        lastModified: new Date(Date.parse(data.lastModified))
                    }]);
                });
            });
        });
    }
});
