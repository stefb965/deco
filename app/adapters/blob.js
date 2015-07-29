import DS from 'ember-data';
import serializer from '../serializers/azure-storage';
import accountUtils from '../utils/account';
/**
 * Adapter for Blobs, briding Ember Data and the Azure Storage Node Module
 */
export default DS.Adapter.extend({
    serializer: serializer.create(),
    nodeServices: Ember.inject.service(),

    /**
     * Implementation of Ember Data's find method, returning a blob's meta data.
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    find: function (store, type, snapshot) {
        var blobService = this.get('azureStorage').createBlobService(store.account_name, store.account_key);
        return new Ember.RSVP.Promise((resolve, reject) => {
            blobService.getBlobProperties(snapshot.get('container').name, snapshot.get('name'), (error, result) => {
                if (error) {
                    appInsights.trackException(error);
                    return Ember.run(null, reject, error);
                }
                return Ember.run(null, resolve, result);
            });
        });
    },

    /**
     * Ember Data's createRecord method - not implemented (because blobs are read-only)
     */
    createRecord: function () {
        throw 'not implemented ';
    },

    /**
     * Ember Data's updateRecord method - Only Updates Valid Property Fields
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    updateRecord: function (store, type, snapshot) {
        var self = this;
        return accountUtils.getActiveAccount(store).then(account => {
            return new Ember.RSVP.Promise((resolve, reject) => {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'), account.get('key')),
                    properties = {};

                properties.contentLanguage = snapshot.get('contentLanguage');
                properties.contentMD5 = snapshot.get('contentMd5');
                properties.contentDisposition = snapshot.get('contentDisposition');

                blobService.setBlobProperties(snapshot.get('container_id'), snapshot.get('name'), properties,
                    err => {
                        if (err) {
                            return reject(err);
                        }

                        return resolve();
                    }
                );
            });
        });
    },

    /**
     * Ember Data's deleteRecord method, sending a delete request using the Azure Storage Node Module
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    deleteRecord: function (store, type, snapshot) {
        var self = this;
        return new Ember.RSVP.Promise((resolve, reject) => {
            var blobService;

            accountUtils.getActiveAccount(store).then(account => {
                blobService = self.get('azureStorage').createBlobService(account.get('name'), account.get('key'));
                return store.find('container', snapshot.attr('container_id'));
            }).then(container => {
                blobService.deleteBlob(container.get('name'), snapshot.attr('name'), (error) => {
                    if (error) {
                        appInsights.trackException(error);
                        return Ember.run(null, reject, error);
                    }
                    return Ember.run(null, resolve);
                });
            });
        });
    },

    /**
     * Ember Data's findAll method, used to retrieve all records for a given type. Not implemented, because we only
     * query the Azure Storage Node Module on a per-container basis.
     */
    findAll: function () {
        throw 'not implemented';
    },

    /**
     * Ember Data's findQuery method, getting all blobs for the current view from the Azure Storage Node Module
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    findQuery: function (store, type, snapshot) {
        var self = this;
        return new Ember.RSVP.Promise((resolve, reject) => {
            accountUtils.getActiveAccount(store).then(account => {
                var blobService = self.get('azureStorage').createBlobService(account.get('name'), account.get('key')),
                    // null means root directory
                    prefix = (snapshot.prefix === '/') ? null : snapshot.prefix;

                blobService.listBlobsSegmentedWithPrefix(snapshot.container.get('name'), prefix, null, { delimiter: '/' }, (error, result) => {
                    var blobs = [];

                    if (error) {
                        appInsights.trackException(error);
                        return Ember.run(null, reject, error);
                    }

                    // Fill out the blob models
                    for (var i in result.entries) {
                        if (i % 1 === 0) {
                            blobs.push({
                                id: result.entries[i].name,
                                name: result.entries[i].name,
                                size: parseInt(result.entries[i].properties['content-length']),
                                type: result.entries[i].properties['content-type'],
                                lastModified: new Date(Date.parse(result.entries[i].properties['last-modified'])),
                                container: snapshot.container,
                                leaseState: result.entries[i].properties.leasestate,
                                leaseStatus: result.entries[i].properties.leasestatus,
                                container_id: snapshot.container_id,
                                blobType: result.entries[i].properties.blobtype,
                                contentLanguage: result.entries[i].properties['content-language'],
                                contentMd5: result.entries[i].properties['content-md5'],
                                contentDisposition: result.entries[i].properties['content-disposition'],
                                leaseID: result.entries[i].properties.leaseid,
                                etag: result.entries[i].properties.etag
                            });
                        }
                    }

                    return Ember.run(null, resolve, blobs);
                });
            });
        });
    },

    /**
     * An alias for the Azure Storage Node Module.
     */
    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});
