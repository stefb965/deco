import DS from 'ember-data';
import accountUtil from '../utils/account';

var Container = DS.Model.extend({
    nodeServices: Ember.inject.service(),

    // filters result of blobs property
    blobPrefixFilter: DS.attr('string', {
        defaultValue: ''
    }),

    blobs: function () {
        return this.store.find('blob', {
            container: this,
            container_id: this.get('name'),
            prefix: this.get('blobPrefixFilter')
        });
    }.property().volatile(),

    name: DS.attr('string', {
        defaultValue: ''
    }),
    lastModified: DS.attr('date', {
        defaultValue: ''
    }),
    publicAccessLevel: ('string', {
        defaultValue: null
    }),

    listDirectoriesWithPrefix: function (prefix) {
        var self = this;
        var service;

        return new Ember.RSVP.Promise((resolve, reject) => {
            accountUtil.getActiveAccount(self.store).then(account => {
                service = self.get('azureStorage').createBlobService(account.get('name'), account.get('key'));
                service.listBlobDirectoriesSegmentedWithPrefix(self.get('name'), prefix, null,  (err, result) => {
                    if (err) {
                        return reject(err);
                    }

                    var entries = [];
                    result.entries.forEach(dir => {
                        // our own directory is not a subdirectory of itself
                        // azure api will return it though - so filter it
                        if (dir.name !== prefix) {
                            entries.push(dir);
                        }
                    });

                    return resolve(entries);
                });
            });
        });
    },

    uploadBlob: function (path, blobName) {
        var container = this.get('name');
        var self = this;
        var service;

        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(self.store).then(account => {
                service = self.get('azureStorage').createBlobService(account.get('name'), account.get('key'));
                service.createBlockBlobFromLocalFile(container, blobName, path, (err, result, response) => {
                    if (!err) {
                        return resolve(response.entries);
                    } else {
                        return reject(err);
                    }
                });
            });
        });
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});

export default Container;
