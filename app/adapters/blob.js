import DS from 'ember-data';

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

    updateRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azurestorage'),
            blobService = azureStorage.createBlobService(store.account_name, store.account_key);

        return new Ember.RSVP.Promise(function (resolve, reject) {
            blobService.setBlobProperties(snapshot.get('name'), { name: snapshot.get('name')}, function (err, data) {
                if (err) {
                    return Ember.run(null, reject, err);
                }
                return Ember.run(null, resolve, data);
            });
        });
    },

    deleteRecord: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage'),
            blobService = azureStorage.createBlobService(store.account_name, store.account_key);

        return new Ember.RSVP.Promise(function (resolve, reject) {
            blobService.deleteBlob(snapshot.blob, function (err, data) {
                if (err) {
                    return Ember.run(null, reject, err);
                }
                return Ember.run(null, resolve, data);
            });
        });
    },

    findAll: function () {
        throw 'not implemented';
    },

    findQuery: function (store, type, snapshot) {
        var azureStorage = window.requireNode('azure-storage');

        return new Ember.RSVP.Promise(function (resolve, reject) {
            getActiveAccount(store).then(function (account) {
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
                                container: snapshot.container
                            });
                        }
                    }

                    return Ember.run(null, resolve, blobs);
                });
            });

        });
    }
});
