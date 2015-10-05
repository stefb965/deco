import Ember from 'ember';
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
        return accountUtils.getBlobService(this.store, this.get('azureStorage'))
            .then(blobService => {
                var getBlobProperties = Ember.RSVP.denodeify(blobService.getBlobProperties);
                return getBlobProperties.call(getBlobProperties, snapshot.attr('container').name, snapshot.attr('name'));
            })
            .catch(error => {
                Ember.Logger.error(error);
                appInsights.trackException(error);
                throw error;
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
        return accountUtils.getBlobService(self.store, self.get('azureStorage'))
            .then(blobService => {
                var properties = {},
                    setBlobProperties = Ember.RSVP.denodeify(blobService.setBlobProperties);

                properties.contentLanguage = snapshot.attr('contentLanguage');
                properties.contentMD5 = snapshot.attr('contentMd5');
                properties.contentDisposition = snapshot.attr('contentDisposition');

                return setBlobProperties.call(blobService, snapshot.attr('container_id'),
                    snapshot.attr('name'), properties);
            })
            .then(blobResult => {
                blobResult.id = blobResult.blob;
                return blobResult;
            })
            .catch(error => {
                Ember.Logger.error(error);
                appInsights.trackException(error);
                throw error;
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
        var self = this,
            blobService;
        return accountUtils.getBlobService(self.store, self.get('azureStorage'))
            .then(blobSvc => {
                blobService = blobSvc;
                return store.find('container', snapshot.attr('container_id'));
            })
            .then(container => {
                var deleteBlob = Ember.RSVP.denodeify(blobService.deleteBlob);

                return deleteBlob.call(blobService, container.get('name'), snapshot.attr('name'));
            })
            .catch(error => {
                Ember.Logger.error(error);
                appInsights.trackException(error);
                throw error;
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
        var prefix = (snapshot.prefix === '/') ? null : snapshot.prefix, // null means root directory
            name = snapshot.container.get('name'),
            token = snapshot.container.get('currentToken');

        return accountUtils.getBlobService(this.store, this.get('azureStorage')).then(blobService => {
            let listBlobsSegmentedWithPrefix = Ember.RSVP.denodeify(blobService.listBlobsSegmentedWithPrefix);

            return listBlobsSegmentedWithPrefix.call(blobService, name, prefix, token, {
                delimiter: '/',
                maxResults: 100,
                useNagleAlgorithm: true
            });
        }).then(result => {
            // Save the continuation token (even if it's empty)
            store.find('container', snapshot.container_id).then((foundContainer) => {
                try {
                    foundContainer.set('currentToken', result.continuationToken);
                } catch (error) {}
            });

            return new Ember.RSVP.Promise(function (resolve) {
                var blobs = [];

                // Fill out the blob models
                result.entries.forEach(entry => {
                    blobs.push({
                        id: entry.name,
                        name: entry.name,
                        size: parseInt(entry.properties['content-length']),
                        type: entry.properties['content-type'],
                        lastModified: new Date(Date.parse(entry.properties['last-modified'])),
                        container: snapshot.container,
                        leaseState: entry.properties.leasestate,
                        leaseStatus: entry.properties.leasestatus,
                        container_id: snapshot.container_id,
                        blobType: entry.properties.blobtype,
                        contentLanguage: entry.properties['content-language'],
                        contentMd5: entry.properties['content-md5'],
                        contentDisposition: entry.properties['content-disposition'],
                        leaseID: entry.properties.leaseid,
                        etag: entry.properties.etag
                    });
                });

                resolve(blobs);
            });
        }).catch(error => {
            Ember.Logger.error(error);
            appInsights.trackException(error);
            throw error;
        });
    },

    /**
     * An alias for the Azure Storage Node Module.
     */
    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});
