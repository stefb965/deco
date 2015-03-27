import DS from 'ember-data';
<<<<<<< HEAD
import accountUtil from '../utilities/account';
import serializer from '../serializers/azure-storage';
export default DS.Adapter.extend({
    serializer: serializer.create(),
    find: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
=======

// Helper
function getActiveAccount(store) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
        var accounts = store.all('account'),
            length = accounts.get('length'),
            i = 0;

        accounts.forEach(function (account) {
            if (account.get('activeAccount') === true) {
                return Ember.run(null, resolve, account);
            }

            i += 1;
            if (i >= length) {
                return Ember.run(null, reject, 'could not find any active accounts');
            }
        });
    });
}

export default DS.Adapter.extend({
    find: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');

        return new Ember.RSVP.Promise(function (resolve, reject) {
            getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'), account.get('key'));

>>>>>>> master
                blobService.getContainerProperties(snapshot.name, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
<<<<<<< HEAD
                    return Ember.run(null, resolve, [{
                        name: data.name,
                        id: data.name,
                        lastModified: data.lastModified
                    }]);
=======
                    return Ember.run(null, resolve, [{name: data.name, id: data.name, lastModified: data.lastModified}]);
>>>>>>> master
                });
            });
        });
    },
<<<<<<< HEAD
    createRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
=======

    createRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');

        return new Ember.RSVP.Promise(function (resolve, reject) {
            getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));

>>>>>>> master
                blobService.createContainerIfNotExists(snapshot.get('name'), function (err) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, snapshot);
                });
            });
        });
    },
<<<<<<< HEAD
    updateRecord: function () {
        throw 'not implemented';
    },
    deleteRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
=======

    updateRecord: function () {
        throw 'not implemented';
    },

    deleteRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');

        return new Ember.RSVP.Promise(function (resolve, reject) {
            getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));

>>>>>>> master
                blobService.deleteContainer(snapshot.get('name'), function (err) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    return Ember.run(null, resolve, null);
                });
            });
        });
    },
<<<<<<< HEAD
    findAll: function (store) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
                blobService.listContainersSegmented(null, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    var containerModels = [];
=======

    findAll: function (store) {
        var azureStorage = window.requireNode('azure-storage');

        return new Ember.RSVP.Promise(function (resolve, reject) {
            getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'), account.get('key')),
                    containerModels = [];

                blobService.listContainersSegmented(null, function (err, data){

                    if (err) {
                        return Ember.run(null, reject, err);
                    }

>>>>>>> master
                    for (var i in data.entries) {
                        if (i % 1 === 0) {
                            containerModels.push({
                                id: data.entries[i].name,
                                name: data.entries[i].name,
<<<<<<< HEAD
                                lastModified: new Date(Date.parse(data.entries[i].properties['last-modified']))
=======
                                lastModified: data.entries[i].properties['last-modified']
>>>>>>> master
                            });
                        }
                    }
                    return Ember.run(null, resolve, containerModels);
                });
            });
        });
    },
<<<<<<< HEAD
    findQuery: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'),
                    account.get('key'));
=======

    findQuery: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');

        return new Ember.RSVP.Promise(function (resolve, reject) {
            getActiveAccount(store).then(function (account) {
                var blobService = azureStorage.createBlobService(account.get('name'), account.get('key'));

>>>>>>> master
                blobService.getContainerProperties(snapshot.name, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
<<<<<<< HEAD
                    console.log(data.name);
                    console.log(data.lastModified);
                    console.log('new model:');
                    console.dir({
                        name: data.name,
                        id: data.name,
                        lastModified: new Date(Date.parse(data.lastModified))
                    });
                    return Ember.run(null, resolve, [{
                        name: data.name,
                        id: data.name,
                        lastModified: new Date(Date.parse(data.lastModified))
                    }]);
=======
                    return Ember.run(null, resolve, [{name: data.name, id: data.name, lastModified: data.lastModified}]);
>>>>>>> master
                });
            });
        });
    }
});
