import DS from 'ember-data';
import serializer from '../serializers/azure-storage';
import accountUtils from '../utils/account';

export default DS.Adapter.extend({
    serializer: serializer.create(),
    nodeServices: Ember.inject.service(),

    /**
     * Implementation of Ember Data's find method, returning a containers's meta data.
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    find: function (store, type, id, snapshot) {
        var self = this;

        if (!snapshot || !snapshot.attr('name')) {
            return;
        }

        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'),
                    account.get('key'));

                blobService.getContainerProperties(snapshot.attr('name'), function (err, data) {
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

    /**
     * Implementation of Ember Data's createRecord method, creating a container if one doesn't exist.
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    createRecord: function (store, type, snapshot) {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'),
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

    /**
     * Ember Data's updateRecord method. Not implemented.
     */
    updateRecord: function () {
        throw 'not implemented';
    },

    /**
     * Implementation of Ember Data's deleteRecord method, deleting a container.
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    deleteRecord: function (store, type, snapshot) {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'),
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

    /**
     * Implementation of Ember Data's findAll method, returning all containers for the current account.
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @return {Promise}
     */
    findAll: function (store) {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'),
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

    /**
     * Ember Data's findQuery method, getting all containers for the current view from the Azure Storage Node Module
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    findQuery: function (store, type, snapshot) {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtils.getActiveAccount(store).then(function (account) {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'),
                    account.get('key'));
                blobService.listContainersSegmented(null, function (err, data) {
                    if (err) {
                        return Ember.run(null, reject, err);
                    }
                    var results = [];
                    for (var i in data.entries) {
                        if (i % 1 === 0 &&
                            data.entries[i].name.indexOf(snapshot.name) > -1) {

                            results.push({
                                name: data.entries[i].name,
                                id: data.entries[i].name,
                                lastModified: new Date(Date.parse(data.entries[i].lastModified))
                            });
                        }
                    }
                    return Ember.run(null, resolve, results);
                });
            });
        });
    },

    /**
     * An alias for the Azure Storage Node Module.
     */
    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});
